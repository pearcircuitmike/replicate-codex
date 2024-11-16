import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Image,
  Box,
} from "@chakra-ui/react";

const ImageLightbox = ({ src, alt }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
      <Box
        borderWidth="1px"
        borderRadius="md"
        overflow="hidden"
        boxShadow="xs"
        cursor="zoom-in"
        onClick={() => setIsOpen(true)}
        transition="all 0.2s"
        _hover={{ transform: "scale(1.02)" }}
      >
        <Image src={src} alt={alt} objectFit="cover" w="100%" h="350px" />
      </Box>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setIsZoomed(false);
        }}
        size="full"
      >
        <ModalOverlay bg="rgba(0, 0, 0, 0.85)" />
        <ModalContent
          margin={0}
          cursor="zoom-out"
          bg="transparent"
          onClick={() => {
            setIsOpen(false);
            setIsZoomed(false);
          }}
        >
          <ModalCloseButton color="white" zIndex="popover" />
          <ModalBody
            p={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            position="relative"
          >
            <Image
              src={src}
              alt={alt}
              maxHeight="90vh"
              width="auto"
              objectFit="contain"
              transition="all 0.3s ease"
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ImageLightbox;
