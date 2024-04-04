import parse, { domToReact } from "html-react-parser";
import {
  Box,
  Heading,
  Text,
  Link,
  Tag,
  VStack,
  List,
  ListItem,
  Code,
  chakra,
  Center,
} from "@chakra-ui/react";
import PreviewImage from "../PreviewImage";
import { kebabToTitleCase } from "@/utils/kebabToTitleCase";
import emojiMap from "../../data/emojiMap.json";

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

const getEmojiForModel = (modelName) => {
  const keywords = modelName.toLowerCase().split(" ");
  for (const keyword of keywords) {
    if (emojiMap[keyword]) {
      return emojiMap[keyword];
    }
  }
  return getRandomEmoji(modelName);
};

const ModelOverview = ({ model }) => {
  const bgColor1 = getColorByTitle(model?.modelName, 0);
  const bgColor2 = getColorByTitle(model?.modelName, 1);
  const gradientBg = `linear(to-r, ${bgColor1}, ${bgColor2})`;

  return (
    <Box>
      <VStack alignItems="left" spacing={2}>
        <Heading as="h1" size="2xl" style={{ wordBreak: "break-all" }}>
          {kebabToTitleCase(model?.modelName)}
        </Heading>
        <Text>
          <Link
            href={`/creators/${model?.platform}/${model?.creator}`}
            color="blue.500"
          >
            {model?.creator}
          </Link>
        </Text>
        {model?.example ? (
          <PreviewImage
            width={"100%"}
            src={model?.example}
            id={model?.id}
            modelName={model?.modelName}
          />
        ) : (
          <Center h="250px" w="100%" bgGradient={gradientBg}>
            <Text fontSize="6xl">{getEmojiForModel(model?.modelName)}</Text>
          </Center>
        )}
        <Box>
          {" "}
          {model?.generatedSummary
            ? model?.generatedSummary
            : model.description}
          <br />
          {model.generatedUseCase && (
            <>
              <Heading as="h2" size="md" mt={"1em"}>
                Use cases
              </Heading>
              <Text>{model.generatedUseCase}</Text>
            </>
          )}
        </Box>
        <Box>
          <Tag colorScheme="teal">{model?.tags}</Tag>
        </Box>
      </VStack>
    </Box>
  );
};

export default ModelOverview;
