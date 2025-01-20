import React, { useState, useEffect } from "react";
import Script from "next/script";
import {
  Box,
  Flex,
  Text,
  Spinner,
  Image,
  SimpleGrid,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  IconButton,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

const PDFViewerClient = ({ url }) => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    let isSubscribed = true;

    const loadPDF = async () => {
      if (!scriptLoaded) return;

      try {
        setLoading(true);
        setError(null);

        const pdfUrl = url.includes("arxiv.org")
          ? `https://pdf-proxy.mike-465.workers.dev/?url=${encodeURIComponent(
              url
            )}`
          : url;

        const pdfjsLib = window.pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;

        if (!isSubscribed) return;

        const renderedPages = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          if (!isSubscribed) return;

          renderedPages.push({
            pageNum: i,
            imageUrl: canvas.toDataURL("image/jpeg", 0.8),
          });

          setPages([...renderedPages]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error in PDF processing:", err);
        if (isSubscribed) {
          if (err.name === "UnknownErrorException") {
            setError(
              "Could not load the PDF. The file might be protected or corrupted."
            );
          } else {
            setError(`Error loading PDF: ${err.message}`);
          }
          setLoading(false);
        }
      }
    };

    if (url) {
      loadPDF();
    }

    return () => {
      isSubscribed = false;
    };
  }, [url, scriptLoaded]);

  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsZoomed(!isZoomed);
    }
  };

  const navigatePages = (direction) => {
    const currentIndex = pages.findIndex(
      (p) => p.pageNum === selectedPage.pageNum
    );
    const nextIndex = currentIndex + direction;

    if (nextIndex >= 0 && nextIndex < pages.length) {
      setSelectedPage(pages[nextIndex]);
    }
  };

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        strategy="afterInteractive"
        onReady={() => {
          console.log("PDF.js script loaded");
          setScriptLoaded(true);
        }}
        onError={(e) => {
          console.error("Error loading PDF.js:", e);
          setError("Failed to load PDF viewer library.");
        }}
      />

      {error && (
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          {error}
        </Alert>
      )}

      <Box>
        {loading && (
          <Flex justify="center" align="center" h="100px" mb={4}>
            <Spinner size="xl" />
            <Text ml={4}>Loading PDF pages...</Text>
          </Flex>
        )}

        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
          {pages.map((page) => (
            <Box
              key={page.pageNum}
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              boxShadow="lg"
              cursor="zoom-in"
              onClick={() => setSelectedPage(page)}
              transition="all 0.2s"
              _hover={{ transform: "scale(1.02)" }}
            >
              <Image
                src={page.imageUrl}
                alt={`Page ${page.pageNum}`}
                width="100%"
                loading="lazy"
                fallback={<Spinner />}
              />
            </Box>
          ))}
        </SimpleGrid>

        <Modal
          isOpen={selectedPage !== null}
          onClose={() => {
            setSelectedPage(null);
            setIsZoomed(false);
          }}
          size="full"
        >
          <ModalOverlay bg="rgba(0, 0, 0, 0.85)" />
          <ModalContent
            margin={0}
            cursor={isZoomed ? "zoom-out" : "zoom-in"}
            bg="transparent"
          >
            <ModalCloseButton color="white" zIndex="popover" />
            <ModalBody
              p={0}
              display="flex"
              alignItems="center"
              justifyContent="center"
              onClick={handleModalClick}
              position="relative"
            >
              {selectedPage && (
                <Image
                  src={selectedPage.imageUrl}
                  alt={`Page ${selectedPage.pageNum}`}
                  maxHeight={isZoomed ? "none" : "90vh"}
                  width="auto"
                  objectFit="contain"
                  transition="all 0.3s ease"
                />
              )}

              <IconButton
                icon={<ChevronLeftIcon boxSize={8} />}
                position="absolute"
                left={4}
                top="50%"
                transform="translateY(-50%)"
                onClick={() => navigatePages(-1)}
                isDisabled={!selectedPage || selectedPage.pageNum === 1}
                variant="ghost"
                color="white"
                _hover={{ bg: "whiteAlpha.200" }}
                aria-label="Previous page"
                size="lg"
              />

              <IconButton
                icon={<ChevronRightIcon boxSize={8} />}
                position="absolute"
                right={4}
                top="50%"
                transform="translateY(-50%)"
                onClick={() => navigatePages(1)}
                isDisabled={
                  !selectedPage || selectedPage.pageNum === pages.length
                }
                variant="ghost"
                color="white"
                _hover={{ bg: "whiteAlpha.200" }}
                aria-label="Next page"
                size="lg"
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </>
  );
};

export default PDFViewerClient;
