import { useState } from "react";
import { Button } from "@chakra-ui/react";

export default function ShareLinkButton() {
  const [copySuccess, setCopySuccess] = useState(false);

  function copyToClipboard() {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
  }

  return (
    <Button onClick={copyToClipboard}>
      {copySuccess ? "Copied!" : "Share Link"}
    </Button>
  );
}
