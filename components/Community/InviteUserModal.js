// components/Community/InviteUserModal.jsx
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function InviteUserModal({ communityId, userId }) {
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

    if (!user || !accessToken) {
      setError("You must be logged in to send invites.");
      return;
    }

    if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      // POST to /api/community/[communityId]/invite
      const resp = await fetch(`/api/community/${communityId}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`, // if you want to verify on server
        },
        body: JSON.stringify({
          inviteeEmail: email.trim().toLowerCase(),
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        setError(data.error || "Failed to create invite.");
      } else {
        // Could be 200, 201, etc.
        setSuccessMsg(data.message || "Invite created successfully.");
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
        Invite someone
      </Button>

      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Invite someone to this community</ModalHeader>
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
            {error && (
              <Text color="red.500" mt={2}>
                {error}
              </Text>
            )}
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
