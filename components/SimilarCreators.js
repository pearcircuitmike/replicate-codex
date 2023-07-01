import { useEffect, useState } from "react";
import { Box, Heading } from "@chakra-ui/react";
import CreatorCard from "./CreatorCard";
import { fetchCreator } from "../utils/fetchCreator";

export default function SimilarCreators({ similarCreators }) {
  const [creatorData, setCreatorData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const creators = await Promise.all(
        similarCreators.slice(0, 4).map((creator) =>
          fetchCreator({
            viewName: "unique_creators_with_runs",
            creatorName: creator,
          })
        )
      );

      const nonEmptyCreators = creators.filter(
        (response) => response.data && response.data.length > 0
      );

      setCreatorData(nonEmptyCreators.map((response) => response.data[0]));
    };

    fetchData();
  }, [similarCreators]);

  return (
    <Box display="flex" flexWrap="wrap">
      {creatorData.map((creator) => (
        <Box
          key={creator.id}
          width={{ base: "100%", sm: "50%", md: "33%", lg: "25%" }}
          p="4"
        >
          <CreatorCard creator={creator} />
        </Box>
      ))}
    </Box>
  );
}
