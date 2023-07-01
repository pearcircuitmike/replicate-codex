import React, { useState, useEffect } from "react";
import { Box, Image as ChakraImage, Skeleton } from "@chakra-ui/react";

const gradients = [
  "linear(to-r, gray.400, gray.500)",
  "linear(to-r, blue.400, blue.500)",
  "linear(to-r, teal.400, teal.500)",
];

const PreviewImage = ({ src }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [bgGradient, setBgGradient] = useState("");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * gradients.length);
    setBgGradient(gradients[randomIndex]);

    if (src && src.trim() !== "") {
      const img = new window.Image();
      img.src = src;

      img.onload = () => {
        setIsLoading(false);
      };

      img.onerror = () => {
        setHasError(true);
        console.error(`Error loading image: ${src}`);
      };
    } else {
      setIsLoading(false);
    }
  }, [src]);

  const displayFallback = !src || src.trim() === "" || hasError;

  return (
    <>
      {displayFallback ? (
        <Box
          bgGradient={bgGradient}
          width="100%"
          height="100%"
          display="flex"
          justifyContent="center"
          alignItems="center"
          fontSize="xl"
          fontWeight="bold"
          color="white"
          minH="350px"
          textAlign="center"
        >
          No Preview
        </Box>
      ) : (
        <Skeleton
          isLoaded={!isLoading}
          startColor="gray.300"
          endColor="gray.500"
          mb="8"
          width="100%"
          height="100%"
        >
          <ChakraImage
            src={src}
            alt="AI model preview image"
            objectFit="cover"
            boxSize="100%"
          />
        </Skeleton>
      )}
    </>
  );
};

export default PreviewImage;
