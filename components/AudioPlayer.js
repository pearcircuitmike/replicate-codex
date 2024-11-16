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
import { FaPlay, FaPause, FaVolumeMute, FaVolumeUp } from "react-icons/fa";

const AudioPlayer = ({ text }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    // Try to get saved volume from localStorage, default to 1
    const savedVolume = localStorage.getItem("audioPlayerVolume");
    return savedVolume ? parseFloat(savedVolume) : 1;
  });
  const [isVolumeSliderVisible, setIsVolumeSliderVisible] = useState(false);
  const router = useRouter();

  // Save volume to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("audioPlayerVolume", volume.toString());
  }, [volume]);

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
    utterance.volume = volume;
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
    const sections = textToSpeak.split(/(?=##\s)/);

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

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (isPlaying) {
      // Restart speech with new volume
      const words = text.split(" ");
      const position = Math.floor((currentTime / duration) * words.length);
      const remainingText = words.slice(position).join(" ");
      cleanAndSpeak(remainingText);
    }
  };

  const toggleMute = () => {
    if (volume > 0) {
      setVolume(0);
    } else {
      setVolume(1);
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

        <Box
          position="relative"
          onMouseEnter={() => setIsVolumeSliderVisible(true)}
          onMouseLeave={() => setIsVolumeSliderVisible(false)}
        >
          <IconButton
            aria-label={volume === 0 ? "Unmute" : "Mute"}
            icon={<Icon as={volume === 0 ? FaVolumeMute : FaVolumeUp} />}
            onClick={toggleMute}
            size="sm"
          />
          {isVolumeSliderVisible && (
            <Box
              position="absolute"
              bottom="100%"
              left="50%"
              transform="translateX(-50%)"
              mb={2}
              bg="white"
              p={3}
              borderRadius="md"
              boxShadow="md"
              width="100px"
            >
              <Slider
                aria-label="Volume"
                value={volume}
                min={0}
                max={1}
                step={0.01}
                onChange={handleVolumeChange}
                orientation="vertical"
                minH="100px"
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>
          )}
        </Box>
      </HStack>
    </Box>
  );
};

export default AudioPlayer;
