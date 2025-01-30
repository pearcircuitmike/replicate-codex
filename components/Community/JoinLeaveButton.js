import React, { useState } from "react";
import { Button, useToast } from "@chakra-ui/react";

export default function JoinLeaveButton({
  communityId,
  userId,
  isMember,
  onToggle,
}) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleClick = async () => {
    setLoading(true);
    try {
      const resp = await fetch("/api/community/toggle-membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          communityId,
          join: !isMember,
        }),
      });

      if (!resp.ok) {
        throw new Error("Failed to toggle membership.");
      }

      const data = await resp.json();
      if (data.joined === true) {
        toast({
          title: "Joined community",
          status: "success",
          duration: 1500,
          isClosable: true,
        });
        // Pass both communityId and joined=true
        onToggle?.(communityId, true);
      } else if (data.joined === false) {
        toast({
          title: "Left community",
          status: "info",
          duration: 1500,
          isClosable: true,
        });
        // Pass both communityId and joined=false
        onToggle?.(communityId, false);
      } else {
        // fallback message
        toast({
          title: "Membership updated",
          status: "success",
          duration: 1500,
          isClosable: true,
        });
        onToggle?.(communityId, !isMember);
      }
    } catch (err) {
      console.error("Toggle membership error:", err);
      toast({
        title: "Failed to toggle membership",
        status: "error",
        duration: 1500,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      isLoading={loading}
      onClick={handleClick}
      colorScheme={isMember ? "gray" : "blue"}
    >
      {isMember ? "Leave" : "Join"}
    </Button>
  );
}
