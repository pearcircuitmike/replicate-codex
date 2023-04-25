import { Box, Heading, Text, Link, Tag, VStack } from "@chakra-ui/react";
import PreviewImage from "../PreviewImage";

const ModelOverview = ({ model }) => {
  return (
    <>
      <Box>
        <VStack alignItems="left" spacing={2}>
          <Heading as="h2" size="lg">
            {model?.modelName}
          </Heading>
          <Text>
            <Link href={`/creators/${model?.creator}`} color="blue.500">
              {model?.creator}
            </Link>
          </Text>
          <Box>
            <PreviewImage
              src={
                model?.example != ""
                  ? model?.example
                  : "https://upload.wikimedia.org/wikipedia/commons/d/dc/No_Preview_image_2.png"
              }
            />
          </Box>
          <Text color="gray.700">{model?.description}</Text>
          <Box>
            <Tag colorScheme="teal">{model?.tags}</Tag>
          </Box>
        </VStack>
      </Box>
    </>
  );
};

export default ModelOverview;
