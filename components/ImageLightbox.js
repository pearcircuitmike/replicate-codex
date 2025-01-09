import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Box,
  Image as ChakraImage,
} from "@chakra-ui/react";
import NextImage from "next/image";

/**
 * @param {string}  src        The image source URL
 * @param {string}  alt        Alt text
 * @param {boolean} optimize   If true, use Next.js Image optimization. Otherwise, use plain Chakra Image.
 */
const ImageLightbox = ({ src, alt, optimize = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  // For NextImage (optimize = true), we must specify fill or width/height
  // so the parent container can display it correctly.
  const Thumbnail = optimize ? (
    <Box position="relative" width="100%" height="350px">
      <NextImage src={src} alt={alt} fill style={{ objectFit: "cover" }} />
    </Box>
  ) : (
    <ChakraImage
      src={src}
      alt={alt}
      objectFit="cover"
      width="100%"
      height="350px"
    />
  );

  return (
    <>
      {/* Thumbnail / Preview */}
      <Box
        borderWidth="1px"
        borderRadius="md"
        overflow="hidden"
        boxShadow="xs"
        cursor="zoom-in"
        onClick={() => setIsOpen(true)}
        transition="all 0.2s"
        _hover={{ transform: "scale(1.02)" }}
        width="100%"
        height="350px"
      >
        {Thumbnail}
      </Box>

      {/* Lightbox Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="full">
        <ModalOverlay bg="rgba(0, 0, 0, 0.85)" />
        <ModalContent
          margin={0}
          cursor="zoom-out"
          bg="transparent"
          onClick={() => setIsOpen(false)}
        >
          <ModalCloseButton color="white" zIndex="popover" />
          <ModalBody
            p={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            position="relative"
          >
            {/* If optimize, use Next.js Image again; if not, plain Chakra Image */}
            {optimize ? (
              <Box position="relative" width="80vw" height="80vh">
                <NextImage
                  src={src}
                  alt={alt}
                  fill
                  style={{ objectFit: "contain" }}
                />
              </Box>
            ) : (
              <ChakraImage
                src={src}
                alt={alt}
                maxH="90vh"
                objectFit="contain"
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ImageLightbox;
