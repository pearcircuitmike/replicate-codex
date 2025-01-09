import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Box,
} from "@chakra-ui/react";
import NextImage from "next/image";

const ImageLightbox = ({ src, alt }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
      {/* Thumbnail/Preview */}
      <Box
        borderWidth="1px"
        borderRadius="md"
        overflow="hidden"
        boxShadow="xs"
        cursor="zoom-in"
        onClick={() => setIsOpen(true)}
        transition="all 0.2s"
        _hover={{ transform: "scale(1.02)" }}
        position="relative"
        width="100%"
        height="350px" // Match your original sizing
      >
        <NextImage
          src={src}
          alt={alt}
          fill
          style={{ objectFit: "cover" }}
          // (Optional) If you want Next to handle responsive sizes:
          // sizes="(max-width: 768px) 100vw,
          //        (max-width: 1200px) 50vw,
          //        33vw"
        />
      </Box>

      {/* Lightbox Modal */}
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
            <Box
              position="relative"
              width="auto"
              maxHeight="90vh"
              // If you want the image to scale up to fit the screen,
              // you can set a width, e.g., width="90vw"
            >
              <NextImage
                src={src}
                alt={alt}
                // Use fill if you prefer a more flexible layout
                // or remove fill + set width/height if you prefer.
                style={{ objectFit: "contain" }}
                fill
              />
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ImageLightbox;
