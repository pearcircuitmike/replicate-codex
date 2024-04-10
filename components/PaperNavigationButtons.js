import { Button, Flex, Icon } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { BeatLoader } from "react-spinners";

const PaperNavigationButtons = ({ prevSlug, nextSlug, platform }) => {
  const router = useRouter();
  const [isPrevLoading, setIsPrevLoading] = useState(false);
  const [isNextLoading, setIsNextLoading] = useState(false);

  const handlePrevPaper = async () => {
    if (prevSlug) {
      setIsPrevLoading(true);
      await router.push(`/papers/${platform}/${prevSlug}`);
      setIsPrevLoading(false);
    }
  };

  const handleNextPaper = async () => {
    if (nextSlug) {
      setIsNextLoading(true);
      await router.push(`/papers/${platform}/${nextSlug}`);
      setIsNextLoading(false);
    }
  };

  const isPrevDisabled = !prevSlug || isPrevLoading;
  const isNextDisabled = !nextSlug || isNextLoading;

  return (
    <Flex justify="space-between" wrap="wrap">
      <Button
        onClick={handlePrevPaper}
        disabled={isPrevDisabled}
        leftIcon={<Icon as={FaArrowLeft} />}
        mr={{ base: 0, md: 4 }}
        mb={{ base: 2, md: 0 }}
        width={{ base: "100%", md: "auto" }}
      >
        {isPrevLoading ? (
          <BeatLoader size={8} color="white" />
        ) : (
          "Previous Paper"
        )}
      </Button>
      <Button
        onClick={handleNextPaper}
        disabled={isNextDisabled}
        rightIcon={<Icon as={FaArrowRight} />}
        width={{ base: "100%", md: "auto" }}
      >
        {isNextLoading ? <BeatLoader size={8} color="white" /> : "Next Paper"}
      </Button>
    </Flex>
  );
};

export default PaperNavigationButtons;
