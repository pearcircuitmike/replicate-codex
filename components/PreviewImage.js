import React, { useState, useEffect } from "react";
import {
  Box,
  Image as ChakraImage,
  Skeleton,
  Text,
  Heading,
} from "@chakra-ui/react";

const PreviewImage = ({ src, id, modelName }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
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
      setHasError(true);
    }
  }, [src]);

  const displayFallback = !src || src.trim() === "" || hasError;

  return (
    <>
      {displayFallback ? (
        <Box
          bgImage={`url(https://picsum.photos/seed/${id}/500/500?blur=10)`}
          bgPosition="center"
          bgSize="cover"
          bgRepeat="no-repeat"
          width="100%"
          height="100%"
          display="flex"
          justifyContent="center"
          alignItems="center"
          fontSize="xl"
          color="white"
          minH="250px"
          textAlign="center"
        >
          <Text
            fontSize="xl"
            color="white"
            textAlign="center"
            textShadow="2px 2px 4px rgba(0,0,0,0.5)"
          >
            {modelName ? modelName : "No preview available"}
          </Text>
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
