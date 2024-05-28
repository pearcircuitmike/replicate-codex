// LoginModal.js
import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Link,
} from "@chakra-ui/react";
import NextLink from "next/link";

const LoginModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Sign in Required</ModalHeader>
        <ModalBody>
          <Text>Please sign up or sign in to save your bookmarks.</Text>
        </ModalBody>
        <ModalFooter>
          <NextLink href="/login" passHref>
            <Link>
              <Button colorScheme="blue" mr={3}>
                Sign up / sign in
              </Button>
            </Link>
          </NextLink>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LoginModal;
