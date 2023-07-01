import React from "react";

const GradioEmbed = ({ src }) => {
  const modifiedSrc = `${src}?__theme=light`;

  const iframeStyles = {
    width: "100%",
    height: "100%",
    border: "none",
  };

  return (
    <iframe
      src={modifiedSrc}
      title="Gradio Embed"
      frameBorder="0"
      style={iframeStyles}
    />
  );
};

export default GradioEmbed;
