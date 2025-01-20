import React from "react";
import { VStack, Skeleton } from "@chakra-ui/react";

const NotesSkeleton = () => {
  return (
    <VStack spacing={4} align="stretch">
      {[...Array(3)].map((_, index) => (
        <Skeleton key={index} height="100px" />
      ))}
    </VStack>
  );
};

export default NotesSkeleton;
