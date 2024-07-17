import React from "react";
import { Flex, Image, Text, Tooltip } from "@chakra-ui/react";
import { formatLargeNumber } from "@/pages/api/utils/formatLargeNumber";
const SocialScore = ({ paper }) => {
  return (
    <Tooltip label="Calculated based on factors such as likes, downloads, etc">
      <Flex alignItems="center" cursor="default">
        <Image
          src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-12/256/fire.png"
          alt="Total Score"
          boxSize="16px"
          mr={1}
        />
        <Text fontSize="md">
          {formatLargeNumber(Math.floor(paper.totalScore))}
        </Text>
      </Flex>
    </Tooltip>
  );
};

export default SocialScore;
