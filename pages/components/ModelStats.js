import { VStack, Text } from "@chakra-ui/react";

const ModelStats = ({ model, rank, avgCompletionTimeSeconds }) => {
  return (
    <>
      {model && (
        <VStack align="start" spacing={4}>
          <Text fontSize="lg">
            Model Rank: {rank}
            {rank === 1 ? " 🥇" : ""}
            {rank === 2 ? " 🥈" : ""}
            {rank === 3 ? " 🥉" : ""}
          </Text>
          <Text fontSize="lg">Cost/run: ${model.costToRun}</Text>
          <Text fontSize="lg">Runs: {model.runs.toLocaleString()}</Text>
          <Text fontSize="lg">
            {model.predictionHardware
              ? `Prediction Hardware: ${model.predictionHardware}`
              : ""}
          </Text>
          <Text fontSize="lg">
            {avgCompletionTimeSeconds
              ? `Average Completion Time: ${avgCompletionTimeSeconds} seconds`
              : ""}
          </Text>
        </VStack>
      )}
    </>
  );
};

export default ModelStats;
