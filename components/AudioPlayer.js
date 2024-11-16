import { useState, useEffect } from "react";
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
} from "@chakra-ui/react";
import { FaPlay, FaPause } from "react-icons/fa";

const AudioPlayer = ({ text }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const router = useRouter();

  // Handle route changes
  useEffect(() => {
    const handleRouteChange = () => {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    };

    router.events.on("routeChangeStart", handleRouteChange);

    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
      window.speechSynthesis.cancel();
    };
  }, [router]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    const wordCount = text.split(" ").length;
    const estimatedDuration = (wordCount / 150) * 60;
    setDuration(estimatedDuration);

    // Cleanup on unmount
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [text]);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            clearInterval(interval);
            setIsPlaying(false);
            return duration;
          }
          return prev + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const speak = async (textToSpeak) => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    const voices = window.speechSynthesis.getVoices();
    const ukMaleVoice = voices.find((voice) => voice.name === "Daniel");

    if (ukMaleVoice) {
      utterance.voice = ukMaleVoice;
    }

    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = "en-GB";

    utterance.onstart = () => console.log("Speech started");
    utterance.onend = () => {
      console.log("Speech ended");
      setIsPlaying(false);
      setCurrentTime(duration);
    };
    utterance.onerror = (e) => console.error("Speech error:", e);

    setTimeout(() => {
      try {
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error("Speech synthesis error:", error);
        setIsPlaying(false);
      }
    }, 100);
  };

  const cleanAndSpeak = (textToSpeak) => {
    // First, split the text into sections by headers
    const sections = textToSpeak.split(/(?=##\s)/);

    // Process each section
    const processedText = sections
      .map((section) => {
        if (section.startsWith("##")) {
          return section.replace(/##\s+([^\n]+)/, "$1. . . . .");
        }
        return section;
      })
      .join(" ");

    const cleanText = processedText
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

    speak(cleanText);
  };

  const togglePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      if (currentTime >= duration) {
        setCurrentTime(0);
      }
      setIsPlaying(true);
      cleanAndSpeak(text);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSliderChange = (value) => {
    setCurrentTime(value);
    if (isPlaying) {
      const words = text.split(" ");
      const position = Math.floor((value / duration) * words.length);
      const remainingText = words.slice(position).join(" ");
      cleanAndSpeak(remainingText);
    }
  };

  return (
    <Box bg="gray.100" p={4} borderRadius="md" width="100%">
      <HStack spacing={4}>
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
    </Box>
  );
};

export default AudioPlayer;
