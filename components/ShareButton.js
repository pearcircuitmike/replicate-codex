import React from "react";
import dynamic from "next/dynamic";
import { Button } from "@chakra-ui/react";

// Dynamically import TwitterShareButton with no SSR to prevent server-client mismatch
const TwitterShareButton = dynamic(
  () => import("react-share").then((mod) => mod.TwitterShareButton),
  { ssr: false }
);

const ShareButton = ({ buttonText = "Share on 𝕏", ...shareProps }) => {
  // Prevent server-side rendering for this component by returning null during SSR
  if (typeof window === "undefined") return null;

  return (
    <TwitterShareButton {...shareProps}>
      <Button size="sm" width="full" variant="outline">
        {buttonText}
      </Button>
    </TwitterShareButton>
  );
};

export default ShareButton;
