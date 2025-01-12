import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import {
  Box,
  IconButton,
  Icon,
  HStack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useToast,
} from "@chakra-ui/react";
import { FaPlay, FaPause } from "react-icons/fa";
import { trackEvent } from "@/pages/api/utils/analytics-util";

// Import your auth hook that provides user and hasActiveSubscription
import { useAuth } from "@/context/AuthContext";

const AudioPlayer = ({ text }) => {
  const router = useRouter();
  const toast = useToast();
  const { user, hasActiveSubscription } = useAuth();

  const audioRef = useRef(null);

  // We'll create a new MediaSource each time we start streaming from scratch
  const mediaSourceRef = useRef(null);
  const sourceBufferRef = useRef(null);

  // UI states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStreamStarted, setHasStreamStarted] = useState(false);

  /************************************************
   * 1. Pause if user navigates away
   ************************************************/
  useEffect(() => {
    const handleRouteChange = () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    };
    router.events.on("routeChangeStart", handleRouteChange);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router]);

  /************************************************
   * 2. Pause if page is hidden
   ************************************************/
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  /************************************************
   * 3. Estimate duration from word count
   ************************************************/
  useEffect(() => {
    // We'll show a naive estimate so the slider has *some* range
    const wordCount = text.trim().split(/\s+/).length;
    const estimate = (wordCount / 150) * 60; // 150 WPM
    setDuration(estimate);
  }, [text]);

  /************************************************
   * 4. Create <audio> once
   ************************************************/
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    // Basic audio event handlers
    const handleLoadedMetadata = () => {
      // If the actual audio duration is finite, override the naive estimate
      // If it's Infinity (common for chunked streams), keep our naive estimate
      if (audio.duration && Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(duration);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [duration]);

  /************************************************
   * 5. Clean text
   ************************************************/
  const cleanText = (raw) => {
    const sections = raw.split(/(?=##\s)/);
    const processed = sections
      .map((s) =>
        s.startsWith("##") ? s.replace(/##\s+([^\n]+)/, "$1. . . . .") : s
      )
      .join(" ");

    return processed
      .replace(/(\*\*|__)(.*?)\1/g, "$2")
      .replace(/(\*|_)(.*?)\1/g, "$2")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/^\s*>\s/gm, "")
      .replace(/^\s*[-*_]{3,}\s*$/gm, "")
      .replace(/^\s*[-+*]\s/gm, "")
      .replace(/^\s*\d+\.\s/gm, "")
      .replace(/\n\s*\n/g, " ")
      .replace(/\n/g, " ")
      .trim();
  };

  /************************************************
   * 6. Wait for SourceBuffer to finish updating
   ************************************************/
  const waitForSourceBuffer = () => {
    return new Promise((resolve, reject) => {
      const sb = sourceBufferRef.current;
      if (!sb) {
        return resolve();
      }
      if (!sb.updating) {
        return resolve();
      }
      const onUpdateEnd = () => {
        sb.removeEventListener("updateend", onUpdateEnd);
        sb.removeEventListener("error", onError);
        resolve();
      };
      const onError = (err) => {
        sb.removeEventListener("updateend", onUpdateEnd);
        sb.removeEventListener("error", onError);
        reject(err);
      };
      sb.addEventListener("updateend", onUpdateEnd);
      sb.addEventListener("error", onError);
    });
  };

  /************************************************
   * 7. Start TTS streaming
   ************************************************/
  const startTtsStreaming = async () => {
    setIsLoading(true);

    try {
      const finalText = cleanText(text);
      setHasStreamStarted(true);

      trackEvent("paper_listen", {
        currentTime,
        duration,
        is_restart: currentTime >= duration,
      });

      // Create a brand-new MediaSource for each new streaming session
      mediaSourceRef.current = new MediaSource();
      sourceBufferRef.current = null;

      // Hook the new MediaSource up to our <audio>
      if (audioRef.current) {
        audioRef.current.src = URL.createObjectURL(mediaSourceRef.current);
      }

      // Wait for "sourceopen" to create the SourceBuffer
      await new Promise((resolve, reject) => {
        const ms = mediaSourceRef.current;
        if (!ms) {
          return reject(new Error("No MediaSource"));
        }
        const onSourceOpen = () => {
          ms.removeEventListener("sourceopen", onSourceOpen);
          try {
            sourceBufferRef.current = ms.addSourceBuffer("audio/mpeg");
            resolve(true);
          } catch (err) {
            reject(err);
          }
        };
        ms.addEventListener("sourceopen", onSourceOpen);
      });

      // Now fetch the chunked TTS
      const resp = await fetch("/api/papers/stream-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: finalText }),
      });
      if (!resp.ok) {
        throw new Error("Failed to stream TTS");
      }

      const reader = resp.body.getReader();
      let firstChunk = true;
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        if (streamDone) {
          done = true;
          break;
        }
        if (!value) continue;

        // Wait for the SourceBuffer to be free
        await waitForSourceBuffer();
        if (!sourceBufferRef.current) break;

        sourceBufferRef.current.appendBuffer(value);

        // Wait again for "updateend"
        await waitForSourceBuffer();

        // Start playback on first chunk
        if (firstChunk && audioRef.current) {
          firstChunk = false;
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
      }

      // Done reading chunks
      await waitForSourceBuffer();
      if (
        mediaSourceRef.current &&
        mediaSourceRef.current.readyState === "open"
      ) {
        mediaSourceRef.current.endOfStream();
      }
    } catch (err) {
      console.error("startTtsStreaming error:", err);
      alert("Error streaming TTS. See console.");
    } finally {
      setIsLoading(false);
    }
  };

  /************************************************
   * 8. Toggle play/pause
   ************************************************/
  const togglePlay = async () => {
    // 1) Make sure user is logged in
    if (!user) {
      toast({
        title: "Subscription Required",
        description: "Please upgrade your account to listen to audio.",
        status: "warning",
        duration: 5000,
      });
      return;
    }

    // 2) Check subscription
    if (!hasActiveSubscription) {
      toast({
        title: "Subscription Required",
        description: "Please upgrade your account to listen to audio.",
        status: "warning",
        duration: 5000,
      });
      return;
    }

    // 3) If they pass both checks, allow toggling
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    // If we haven't streamed yet, start now
    if (!hasStreamStarted) {
      await startTtsStreaming();
    } else {
      trackEvent("paper_listen", {
        currentTime,
        duration,
        is_restart: currentTime >= duration,
      });
      audioRef.current.play();
    }
  };

  /************************************************
   * 9. Slider scrub
   ************************************************/
  const handleSliderChange = (val) => {
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  /************************************************
   * 10. Format time
   ************************************************/
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const secsFloor = Math.floor(secs % 60);
    return `${mins}:${secsFloor.toString().padStart(2, "0")}`;
  };

  return (
    <Box bg="gray.100" p={4} borderRadius="md" width="100%">
      <HStack spacing={4}>
        {/* We do NOT disable this button on isLoading, so user can always pause */}
        <IconButton
          aria-label={isPlaying ? "Pause" : "Play"}
          icon={isPlaying ? <Icon as={FaPause} /> : <Icon as={FaPlay} />}
          onClick={togglePlay}
          size="sm"
        />
        <Box flex="1">
          <HStack spacing={4} width="100%">
            <Box minWidth="45px" fontSize="sm">
              {formatTime(currentTime)}
            </Box>
            <Slider
              value={currentTime}
              min={0}
              max={duration}
              step={0.1}
              onChange={handleSliderChange}
              flex="1"
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
            <Box minWidth="45px" fontSize="sm">
              {formatTime(duration)}
            </Box>
          </HStack>
        </Box>
      </HStack>
      {isLoading && (
        <Box mt={2} fontSize="sm" color="gray.600">
          Buffering…
        </Box>
      )}
    </Box>
  );
};

export default AudioPlayer;
