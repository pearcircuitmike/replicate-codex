import React, { useState } from "react";
import { chakra } from "@chakra-ui/react";
import truncate from "html-truncate";

const truncateWithReadMore = (content, length, hasReadMore) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // If content is not provided, default to an empty string.
  const validContent = content || "";

  const fullContent = (
    <div dangerouslySetInnerHTML={{ __html: validContent }} />
  );
  const truncatedContent = (
    <div dangerouslySetInnerHTML={{ __html: truncate(validContent, length) }} />
  );

  const contentToShow = isExpanded ? fullContent : truncatedContent;

  const handleReadMore = () => {
    setIsExpanded(true);
  };

  return (
    <>
      {contentToShow}
      {hasReadMore && !isExpanded && (
        <>
          {" "}
          <chakra.span
            cursor="pointer"
            color="teal.600"
            onClick={handleReadMore}
          >
            Read more »
          </chakra.span>
        </>
      )}
    </>
  );
};

export default truncateWithReadMore;
