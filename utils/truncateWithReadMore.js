import React, { useState } from "react";
import { chakra } from "@chakra-ui/react";

const truncateWithReadMore = (content, length, hasReadMore) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!content || content.length <= length) {
    return content;
  }

  const truncatedContent = isExpanded
    ? content
    : content.slice(0, length) + "...";

  const handleReadMore = () => {
    setIsExpanded(true);
  };

  return (
    <>
      {truncatedContent}
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
