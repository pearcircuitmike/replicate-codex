import React, { useEffect, useState } from "react";
import { IconButton } from "@chakra-ui/react";
import { ChevronUpIcon } from "@chakra-ui/icons";

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled up to given distance
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the event listener on component mount
  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <IconButton
          aria-label="Back to top"
          icon={<ChevronUpIcon />}
          onClick={scrollToTop}
          position="fixed"
          bottom="8"
          right="8"
          size="lg"
          colorScheme="blue"
          boxShadow="md"
          borderRadius="full"
          zIndex={10}
          opacity={0.9}
          _hover={{ opacity: 0.5 }}
        />
      )}
    </>
  );
};

export default BackToTop;
