import React, { useState } from "react";
import {
  Button,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useAuth } from "@/context/AuthContext";

/** A minimal email regex for "something@somewhere.tld" */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function InviteUserModal({ communityId, userId }) {
  // Suppose your AuthContext returns { user, accessToken }
  const { user, accessToken } = useAuth() || {};
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();

  function resetModal() {
    setEmail("");
    setError("");
    setSuccessMsg("");
  }

  function handleClose() {
    resetModal();
    onClose();
  }

  async function handleInvite() {
    setError("");
    setSuccessMsg("");

    // 1) Check if logged in
    if (!user || !accessToken) {
      setError("You must be logged in to send invites.");
      return;
    }

    // 2) Check email format
    if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      // 3) Call the server route
      const resp = await fetch("/api/community/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          communityId,
          inviteeEmail: email.trim().toLowerCase(),
        }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        // Distinguish known errors from the server
        if (resp.status === 429) {
          // Rate limit
          setError(
            "You have reached your daily invite limit. Try again tomorrow."
          );
        } else {
          setError(data.error || data.message || "Failed to create invite.");
        }
      } else {
        // If OK, check if the message says "already exists"
        if (resp.status === 200 && data.message?.includes("already exists")) {
          // The server might return 200 with "Invite already exists..."
          setSuccessMsg(
            "Invite already sent to that user or they are already in this community."
          );
        } else if (resp.status === 201) {
          // success
          setSuccessMsg("Invite created successfully!");
        }

        // optionally reset the email
        setEmail("");
      }
    } catch (err) {
      console.error("Error sending invite:", err);
      setError(err.message || "Something went wrong sending invite.");
    }
  }

  return (
    <>
      <Button onClick={onOpen} colorScheme="blue" size="sm">
        Invite someone to this community
      </Button>

      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Invite someone to join this community</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Email address</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>
            {/* Show error if present */}
            {error && (
              <Text color="red.500" mt={2}>
                {error}
              </Text>
            )}
            {/* Show success if present */}
            {successMsg && (
              <Text color="green.500" mt={2}>
                {successMsg}
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" ml={3} onClick={handleInvite}>
              Send Invitation
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
