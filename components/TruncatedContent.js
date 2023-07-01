import { useState } from "react";
import { Parser } from "html-to-react";

const parser = new Parser();

const TruncatedContent = ({ htmlString, length }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const parsedHtml = parser.parse(htmlString);
  const truncatedHtml = parsedHtml.slice(0, length).join("");

  return (
    <div>
      {!isExpanded && truncatedHtml}
      {isExpanded && parsedHtml}
      {!isExpanded && (
        <span
          onClick={() => setIsExpanded(true)}
          style={{ cursor: "pointer", color: "teal" }}
        >
          Read more »
        </span>
      )}
    </div>
  );
};

export default TruncatedContent;
