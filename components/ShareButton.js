import React from "react";
import { TwitterShareButton } from "react-share";
import { Button } from "@chakra-ui/react";

const ShareButton = (props) => {
  const { buttonText = "Share on 𝕏", ...shareProps } = props;

  return (
    <TwitterShareButton {...shareProps}>
      <Button
        leftIcon={
          <span style={{ fontWeight: "bold", fontSize: "1.2em" }}>𝕏</span>
        }
        bg="black"
        color="white"
        _hover={{ bg: "gray.700" }}
        _active={{ bg: "gray.800" }}
        size="sm"
      >
        {buttonText}
      </Button>
    </TwitterShareButton>
  );
};

export default ShareButton;
