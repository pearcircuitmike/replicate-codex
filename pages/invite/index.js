// pages/invite/index.js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Box, Button, Spinner, Text, useToast } from "@chakra-ui/react";
import { useAuth } from "@/context/AuthContext";

export default function InvitePage() {
  const router = useRouter();
  const toast = useToast();

  const { inviteId } = router.query;
  const { user, accessToken } = useAuth(); // or however you store token

  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // If we haven't got inviteId or already not in "loading", do nothing
    if (!inviteId) return;
    if (status !== "loading") return; // prevents multiple calls

    // If not logged in => "needs-login"
    if (!user || !accessToken) {
      setStatus("needs-login");
      return;
    }

    // Now do single call to accept
    acceptInvite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inviteId, user, accessToken]);

  async function acceptInvite() {
    // Switch to "accepting" so we don't call it again
    setStatus("accepting");

    try {
      const resp = await fetch("/api/community/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ inviteId }),
      });
      const data = await resp.json();

      if (!resp.ok) {
        // We have an error from server
        const err = data.error || "Unknown error";
        switch (err) {
          case "Invite already accepted":
            setStatus("already-accepted");
            break;
          case "Invite is for a different email":
            setStatus("wrong-email");
            break;
          case "Invite expired":
          case "Invite is expired":
            setStatus("expired");
            break;
          case "Invite not found":
            setStatus("notfound");
            break;
          default:
            setStatus("error");
            setErrorMsg(err);
        }
      } else {
        // success
        setStatus("accepted");
        toast({
          title: "Invite accepted!",
          description: "You've joined the community.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // if the server returns { communityId } you can do:
        if (data.communityId) {
          router.push(`/dashboard/communities/${data.communityId}`);
        } else {
          router.push("/dashboard/communities");
        }
      }
    } catch (err) {
      console.error("Error accepting invite:", err);
      setStatus("error");
      setErrorMsg(err.message);
    }
  }

  if (status === "loading") {
    return (
      <Box p={6}>
        <Spinner />
        <Text>Loading invite data...</Text>
      </Box>
    );
  }

  if (status === "needs-login") {
    return (
      <Box p={6}>
        <Text>You need to log in to accept your invite.</Text>
        <Button
          colorScheme="blue"
          mt={4}
          onClick={() =>
            router.push(`/login?redirect=/invite?inviteId=${inviteId}`)
          }
        >
          Log In
        </Button>
      </Box>
    );
  }

  if (status === "accepting") {
    return (
      <Box p={6}>
        <Spinner />
        <Text>Accepting invite...</Text>
      </Box>
    );
  }

  if (status === "already-accepted") {
    return (
      <Box p={6}>
        <Text>
          This invite was already accepted. You may already be a member of this
          community.
        </Text>
        <Button
          colorScheme="blue"
          mt={4}
          onClick={() => router.push("/dashboard/communities")}
        >
          Go to Communities
        </Button>
      </Box>
    );
  }

  if (status === "wrong-email") {
    return (
      <Box p={6}>
        <Text color="red.500">
          You are logged in with a different email than the invite was sent to.
        </Text>
        <Button
          colorScheme="blue"
          mt={4}
          onClick={() => router.push("/dashboard/communities")}
        >
          Go to Communities
        </Button>
      </Box>
    );
  }

  if (status === "expired") {
    return (
      <Box p={6}>
        <Text color="red.500">
          This invite is expired. Please request a new one.
        </Text>
        <Button
          colorScheme="blue"
          mt={4}
          onClick={() => router.push("/dashboard/communities")}
        >
          Go to Communities
        </Button>
      </Box>
    );
  }

  if (status === "notfound") {
    return (
      <Box p={6}>
        <Text color="red.500">Invite not found or invalid.</Text>
        <Button
          colorScheme="blue"
          mt={4}
          onClick={() => router.push("/dashboard/communities")}
        >
          Go to Communities
        </Button>
      </Box>
    );
  }

  if (status === "error") {
    return (
      <Box p={6}>
        <Text color="red.500">Error accepting invite: {errorMsg}</Text>
        <Button
          colorScheme="blue"
          mt={4}
          onClick={() => router.push("/dashboard/communities")}
        >
          Go to Communities
        </Button>
      </Box>
    );
  }

  if (status === "accepted") {
    // Usually we won't see this because we do the toast + redirect
    return (
      <Box p={6}>
        <Text>Invite accepted! Redirecting...</Text>
      </Box>
    );
  }

  return null;
}
