import React, { useState } from "react";
import { chakra, Text } from "@chakra-ui/react";
import truncate from "html-truncate";

const TruncateWithReadMore = ({ content, length, hasReadMore }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const validContent = content || "";
  const fullContent = (
    <div dangerouslySetInnerHTML={{ __html: validContent }} />
  );
  const truncatedContent = (
    <div dangerouslySetInnerHTML={{ __html: truncate(validContent, length) }} />
  );

  const handleReadMore = () => setIsExpanded(true);
  const handleReadLess = () => setIsExpanded(false);

  const contentToShow = isExpanded ? fullContent : truncatedContent;

  if (validContent.length > length && hasReadMore) {
    return (
      <>
        <Text>{contentToShow}</Text>
        {!isExpanded ? (
          <chakra.span
            cursor="pointer"
            color="teal.600"
            onClick={handleReadMore}
          >
            Read more »
          </chakra.span>
        ) : (
          <chakra.span
            cursor="pointer"
            color="teal.600"
            onClick={handleReadLess}
          >
            Read less «
          </chakra.span>
        )}
      </>
    );
  }
  return contentToShow;
};

export default TruncateWithReadMore;
