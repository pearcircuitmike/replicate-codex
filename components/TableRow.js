import React from "react";
import {
  Th,
  Td,
  useMediaQuery,
  Tag,
  Skeleton,
  Link,
  Box,
  Checkbox,
} from "@chakra-ui/react";
import PreviewImage from "./PreviewImage";
import TruncateWithReadMore from "@/components/TruncateWithReadMore";

export default function TableRow({ item, isHeader = false }) {
  const [isMobile] = useMediaQuery("(max-width: 480px)");
  const toTitleCase = (str) => {
    return str.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };

  if (isHeader) {
    return (
      <>
        {!isMobile && <Th>Creator</Th>}
        <Th>Model Name</Th>
        <Th>Description</Th>
        <Th>Example</Th>
        <Th>Tags</Th>
        <Th>Platform</Th>
        <Th isNumeric>Runs</Th>
        <Th isNumeric>Cost</Th>
      </>
    );
  }

  return (
    <>
      {!isMobile && (
        <Td maxW={isMobile ? "120px" : "180px"} isTruncated>
          <Skeleton isLoaded={item}>
            <Link
              href={`/creators/${item?.platform}/${item?.creator}`}
              color="teal"
              textDecoration="underline"
            >
              {item?.creator}
            </Link>
          </Skeleton>
        </Td>
      )}
      <Td maxW={isMobile ? "120px" : "180px"} isTruncated>
        <Link
          href={`/models/${item?.platform}/${item?.id}`}
          color="teal"
          textDecoration="underline"
        >
          {item?.modelName}
        </Link>
      </Td>
      <Td
        style={{ whiteSpace: "normal", wordWrap: "break-word" }}
        maxW={isMobile ? "120px" : "180px"}
      >
        <TruncateWithReadMore
          content={item.description}
          length={75}
          hasReadMore={true}
        />
      </Td>
      <Td width="64px">
        <Box width="64px" height="64px" overflow="hidden">
          <PreviewImage src={item?.example ? item.example : ""} />
        </Box>
      </Td>
      <Td maxW="180px">
        <Tag>{item?.tags}</Tag>
      </Td>
      <Td maxW="180px">{toTitleCase(item?.platform)}</Td>
      <Td isNumeric>{item?.runs?.toLocaleString()}</Td>
      <Td isNumeric>${item?.costToRun ? item.costToRun : "-"}</Td>
    </>
  );
}
