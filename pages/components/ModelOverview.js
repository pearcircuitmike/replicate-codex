import { Box, Heading, Text, Link, Tag, VStack } from "@chakra-ui/react";
import PreviewImage from "./PreviewImage";

const ModelOverview = ({ model }) => {
  return (
    <Box>
      <VStack alignItems="left" spacing={2}>
        <Heading as="h2" size="lg">
          {model.modelName}
        </Heading>
        <Text>
          <Link href={`/creators/${model.creator}`} color="teal">
            {model.creator}
          </Link>
        </Text>
        <Box>
          <PreviewImage src={model.example} />
        </Box>
        <Text color="gray.700">{model.description}</Text>
        <Box>
          <Tag>{model.tags}</Tag>
        </Box>
      </VStack>
    </Box>
  );
};

export default ModelOverview;
