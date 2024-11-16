// PDFViewer.js - The parent component
import dynamic from "next/dynamic";
import { Flex, Spinner, Text } from "@chakra-ui/react";

const PDFViewerClient = dynamic(() => import("./PDFViewerClient"), {
  ssr: false,
  loading: () => (
    <Flex justify="center" align="center" h="400px">
      <Spinner size="xl" />
      <Text ml={4}>Loading PDF viewer...</Text>
    </Flex>
  ),
});

const PDFViewer = ({ url }) => <PDFViewerClient url={url} />;

export default PDFViewer;
