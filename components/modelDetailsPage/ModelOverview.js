import { Box, Heading, Text, Link, Tag, VStack } from "@chakra-ui/react";
import truncateWithReadMore from "@/utils/truncateWithReadMore";
import PreviewImage from "../PreviewImage";

const ModelOverview = ({ model }) => {
  const truncatedDescription = truncateWithReadMore(
    model?.description,
    275,
    true
  );

  return (
    <>
      <Box>
        <VStack alignItems="left" spacing={2}>
          <Heading as="h2" size="lg">
            {model?.modelName}
          </Heading>
          <Text>
            <Link
              href={`/creators/${model?.platform}/${model?.creator}`}
              color="blue.500"
            >
              {model?.creator}
            </Link>
          </Text>
          <PreviewImage src={model?.example} />
          <Text color="gray.700">{truncatedDescription}</Text>
          <Box>
            <Tag colorScheme="teal">{model?.tags}</Tag>
          </Box>
        </VStack>
      </Box>
    </>
  );
};

export default ModelOverview;
