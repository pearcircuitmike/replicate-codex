// EmojiWithGradient.js
import React from "react";
import { Text, Center } from "@chakra-ui/react";
import emojiMap from "../data/emojiMap.json";

const getColorByTitle = (title, index) => {
  const colors = [
    "red.500",
    "orange.500",
    "yellow.500",
    "green.500",
    "teal.500",
    "blue.500",
    "cyan.500",
    "purple.500",
    "pink.500",
  ];
  const hash = title
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorIndex = (hash + index) % colors.length;
  return colors[colorIndex];
};

const getRandomEmoji = (title) => {
  const emojis = Object.values(emojiMap);
  const hash = title
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const randomIndex = Math.abs(hash) % emojis.length;
  return emojis[randomIndex];
};

const getEmojiForTitle = (title) => {
  const keywords = title.toLowerCase().split(" ");
  for (const keyword of keywords) {
    if (emojiMap[keyword]) {
      return emojiMap[keyword];
    }
  }
  return getRandomEmoji(title);
};

const EmojiWithGradient = ({ title, fontSize = "6xl", height = "250px" }) => {
  const bgColor1 = getColorByTitle(title, 0);
  const bgColor2 = getColorByTitle(title, 1);
  const gradientBg = `linear(to-r, ${bgColor1}, ${bgColor2})`;

  return (
    <Center h={height} w="100%" bgGradient={gradientBg}>
      <Text fontSize={fontSize}>{getEmojiForTitle(title)}</Text>
    </Center>
  );
};

export default EmojiWithGradient;
