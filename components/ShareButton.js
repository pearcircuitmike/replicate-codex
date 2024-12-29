import React from "react";
import { Button } from "@chakra-ui/react";

const ShareButton = ({
  buttonText = "Share on 𝕏",
  url,
  title,
  hashtags = [],
  onClick,
}) => {
  const handleShare = () => {
    // Construct the Twitter share URL
    const twitterUrl = new URL("https://twitter.com/intent/tweet");
    twitterUrl.searchParams.append("text", title);
    twitterUrl.searchParams.append("url", url);
    if (hashtags.length > 0) {
      twitterUrl.searchParams.append("hashtags", hashtags.join(","));
    }

    // Open the share link in a new tab
    window.open(twitterUrl.toString(), "_blank", "noopener,noreferrer");

    // Track the share event
    if (onClick) {
      onClick();
    }
  };

  return (
    <Button size="sm" width="full" variant="outline" onClick={handleShare}>
      {buttonText}
    </Button>
  );
};

export default ShareButton;
