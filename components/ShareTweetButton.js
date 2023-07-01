import { Button } from "@chakra-ui/react";

export default function ShareTweetButton() {
  function shareOnTwitter() {
    const tweetText = encodeURIComponent(
      "Check out this model I found on AIModels.fyi: "
    );
    const tweetUrl = encodeURIComponent(window.location.href);
    const shareUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`;
    window.open(shareUrl, "_blank");
  }

  return (
    <Button onClick={shareOnTwitter} m={1}>
      Share on Twitter
    </Button>
  );
}
