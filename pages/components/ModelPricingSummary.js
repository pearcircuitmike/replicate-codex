import {
  Box,
  Heading,
  HStack,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";
import { AiFillDollarCircle } from "react-icons/ai";

const ModelPricingSummary = ({ model }) => {
  return (
    <Box>
      <Heading as="h2" size="md">
        <Icon as={AiFillDollarCircle} boxSize={4} /> Pricing
      </Heading>
      <HStack spacing={4} shouldWrapChildren="true" my={5} overflow="hidden">
        <Stat size="md">
          <StatLabel>Cost per run</StatLabel>
          <StatNumber>
            {model?.costToRun ? `$${model?.costToRun}` : "$-"}
          </StatNumber>
          <StatHelpText>USD</StatHelpText>
        </Stat>
        <Stat size="md">
          <StatLabel>Avg run time</StatLabel>
          <StatNumber>
            {model?.avgCompletionTime ? model?.avgCompletionTime : "-"}
          </StatNumber>
          <StatHelpText>Seconds</StatHelpText>
        </Stat>
        <Stat size="md">
          <StatLabel>Hardware</StatLabel>
          <StatNumber>
            {model?.predictionHardware ? model?.predictionHardware : "-"}
          </StatNumber>
          <StatHelpText>Prediction</StatHelpText>
        </Stat>
      </HStack>
    </Box>
  );
};

export default ModelPricingSummary;
