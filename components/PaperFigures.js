import React, { useState } from "react";
import { Box, Text, IconButton, HStack, Flex, Heading } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ImageLightbox from "@/components/ImageLightbox";

const NavigationControls = ({
  currentSlide,
  totalSlides,
  onPrevClick,
  onNextClick,
}) => (
  <HStack spacing={2} align="center">
    <IconButton
      icon={<ChevronLeftIcon />}
      onClick={onPrevClick}
      rounded="full"
      bg="white"
      shadow="lg"
      size="sm"
      _hover={{ bg: "gray.100" }}
      isDisabled={currentSlide === 0}
    />
    <Text fontSize="sm" color="gray.600">
      {currentSlide + 1}/{totalSlides}
    </Text>
    <IconButton
      icon={<ChevronRightIcon />}
      onClick={onNextClick}
      rounded="full"
      bg="white"
      shadow="lg"
      size="sm"
      _hover={{ bg: "gray.100" }}
      isDisabled={currentSlide === totalSlides - 1}
    />
  </HStack>
);

const FigureCard = ({ figure }) => (
  <div>
    <Box
      position="relative"
      sx={{
        img: {
          maxW: "100%",
          h: "auto",
          display: "block",
          margin: "0 auto",
        },
      }}
    >
      <ImageLightbox
        optimize={true}
        src={figure.content}
        alt={figure.caption}
        initialCaption={figure.originalCaption}
      />
    </Box>
    <Box mt={3} p={3} bg="gray.50" rounded="md">
      <Text fontSize="sm" color="gray.600">
        Original caption: {figure.originalCaption}
      </Text>
    </Box>
  </div>
);

const PaperFigures = ({ figures = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = React.useRef();

  if (!figures?.length) return null;

  const currentFigure = figures[currentSlide];

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={2}>
        <Heading as="h2" fontSize="md" fontWeight="bold">
          {currentFigure.caption}
        </Heading>
        <NavigationControls
          currentSlide={currentSlide}
          totalSlides={figures.length}
          onPrevClick={() => sliderRef.current?.slickPrev()}
          onNextClick={() => sliderRef.current?.slickNext()}
        />
      </Flex>
      <Slider
        ref={sliderRef}
        dots={false}
        infinite={false}
        speed={500}
        slidesToShow={1}
        slidesToScroll={1}
        beforeChange={(_, next) => setCurrentSlide(next)}
        adaptiveHeight
      >
        {figures.map((figure) => (
          <FigureCard key={figure.identifier} figure={figure} />
        ))}
      </Slider>
    </Box>
  );
};

export default PaperFigures;
