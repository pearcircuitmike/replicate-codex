import React from "react";
import { Image, Skeleton } from "@chakra-ui/react";
import { useInView } from "react-intersection-observer";

const PreviewImage = ({ src }) => {
  const fallbackUrl =
    "https://upload.wikimedia.org/wikipedia/commons/d/dc/No_Preview_image_2.png";

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const displayFallback = !src || src === "";

  return (
    <Skeleton
      isLoaded={inView}
      startColor="gray.300"
      endColor="gray.500"
      mb="8"
    >
      <Image
        ref={ref}
        src={inView && !displayFallback ? src : undefined}
        alt="AI model preview image"
        fallbackSrc={displayFallback ? fallbackUrl : undefined}
      />
    </Skeleton>
  );
};

export default PreviewImage;
