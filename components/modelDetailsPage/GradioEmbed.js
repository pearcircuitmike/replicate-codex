import React from "react";
import { Box } from "@chakra-ui/react";

const GradioEmbed = ({ src }) => {
  const modifiedSrc = `${src}?__theme=light`;

  const containerStyles = {
    width: "100%",
    position: "relative",
    overflow: "auto",
    height: "500px", // set a specific height, modify as needed
  };

  const iframeStyles = {
    width: "100%",
    height: "100%",
    border: "none",
  };

  return (
    <>
      <div style={containerStyles}>
        <iframe
          src={modifiedSrc}
          title="Gradio Embed"
          frameBorder="0"
          style={iframeStyles}
        />
      </div>
    </>
  );
};

export default GradioEmbed;
