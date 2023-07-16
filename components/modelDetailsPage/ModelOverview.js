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
} from "@chakra-ui/react";
import PreviewImage from "../PreviewImage";

const ModelOverview = ({ model }) => {
  return (
    <Box>
      <VStack alignItems="left" spacing={2}>
        <Heading as="h1" size="2xl" style={{ wordBreak: "break-all" }}>
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
        <PreviewImage width={"100%"} src={model?.example} />
        <Box>
          {" "}
          {model?.generatedSummary
            ? model?.generatedSummary
            : model.description}
        </Box>
        <Box>
          <Tag colorScheme="teal">{model?.tags}</Tag>
        </Box>
      </VStack>
    </Box>
  );
};

export default ModelOverview;
