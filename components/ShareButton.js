import React from "react";
import dynamic from "next/dynamic";
import { Button } from "@chakra-ui/react";

// Dynamically import TwitterShareButton with no SSR to prevent server-client mismatch
const TwitterShareButton = dynamic(
  () => import("react-share").then((mod) => mod.TwitterShareButton),
  { ssr: false }
);

const ShareButton = (props) => {
  const { buttonText = "Share on 𝕏", ...shareProps } = props;

  // Prevent server-side rendering for this component by returning null during SSR
  if (typeof window === "undefined") return null;

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
