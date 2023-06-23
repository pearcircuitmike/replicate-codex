import React, { useState, useEffect } from "react";
import { Box, Image as ChakraImage, Skeleton } from "@chakra-ui/react";

const gradients = [
  "linear(to-r, gray.300, pink.500)",
  "linear(to-r, #7928CA, #FF0080)",
  "linear(to-r, gray.300, yellow.400, pink.200)",
  "linear(red.100 0%, orange.100 25%, yellow.100 50%)",
];

const PreviewImage = ({ src }) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [bgGradient, setBgGradient] = useState("");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * gradients.length);
    setBgGradient(gradients[randomIndex]);

    if (src && src.trim() !== "") {
      const img = new window.Image();
      img.src = src;

      img.onload = () => {
        setHasLoaded(true);
      };

      img.onerror = () => {
        setHasError(true);
        console.error(`Error loading image: ${src}`);
      };
    }
  }, [src]);

  const displayFallback = !src || src.trim() === "" || hasError;

  return (
    <Skeleton
      isLoaded={hasLoaded || displayFallback}
      startColor="gray.300"
      endColor="gray.500"
      mb="8"
      width="100%"
      height="100%"
    >
      <Box
        as="span"
        display={hasLoaded || displayFallback ? "inline-block" : "none"}
        width="100%"
        height="100%"
        bgGradient={displayFallback ? bgGradient : "none"}
      >
        {!displayFallback && (
          <ChakraImage
            src={src}
            alt="AI model preview image"
            objectFit="cover"
            boxSize="100%"
          />
        )}
      </Box>
    </Skeleton>
  );
};

export default PreviewImage;
