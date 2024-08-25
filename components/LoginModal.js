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
  UnorderedList,
  ListItem,
} from "@chakra-ui/react";
import NextLink from "next/link";

const LoginModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Get a Pro Account for Unlimited Bookmarking</ModalHeader>
        <ModalBody>
          <Text mb={4}>
            Unlock all features of AImodels.fyi with a pro account. As a pro
            user, you get:
          </Text>
          <UnorderedList mb={6}>
            <ListItem>Unlimited bookmarking</ListItem>
            <ListItem>Personalized AI content</ListItem>
            <ListItem>
              Exclusive guides to top models, papers, and tools
            </ListItem>
            <ListItem>Access to the AI expert Discord community</ListItem>
            <ListItem>Weekly AI breakthrough digests</ListItem>
          </UnorderedList>
          <Text>
            Join researchers, developers, and students who stay ahead in AI.
            Create your pro account now!
          </Text>
        </ModalBody>
        <ModalFooter>
          <NextLink href="/login" passHref>
            <Link>
              <Button colorScheme="blue" mr={3}>
                Create Pro Account
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
