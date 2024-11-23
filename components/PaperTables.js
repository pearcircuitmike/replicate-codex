import React, { useState } from "react";
import { Box, Text, IconButton, HStack, Flex, Heading } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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

const TableCard = ({ table }) => (
  <div>
    <Box
      overflowX="auto"
      my={4}
      dangerouslySetInnerHTML={{
        __html: table.tableHtml
          .replace(/^```html\n?/, "")
          .replace(/\n?```$/, ""),
      }}
      sx={{
        table: {
          width: "100%",
          borderCollapse: "collapse",
        },
        "th, td": {
          border: "1px solid",
          borderColor: "gray.200",
          p: 2,
          textAlign: "left",
          fontSize: "xs",
        },
        th: {
          bg: "gray.50",
          fontWeight: "bold",
          fontSize: "xs",
        },
      }}
    />

    <Box mt={3} p={3} bg="gray.50" rounded="md">
      <Text fontSize="sm" color="gray.600">
        Original caption: {table.originalCaption}
      </Text>
    </Box>
  </div>
);

const PaperTables = ({ tables = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = React.useRef();

  if (!tables?.length) return null;

  const currentTable = tables[currentSlide];

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={2}>
        <Heading as="h2" fontSize="md" fontWeight="bold">
          {currentTable.caption}
        </Heading>
        <NavigationControls
          currentSlide={currentSlide}
          totalSlides={tables.length}
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
        {tables.map((table) => (
          <TableCard key={table.identifier} table={table} />
        ))}
      </Slider>
    </Box>
  );
};

export default PaperTables;
