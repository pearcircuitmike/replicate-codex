import * as React from "react";
import { Box, SimpleGrid } from "@chakra-ui/react";
import ModelCard from "./ModelCard";

export default function GalleryView({
  data,
  searchValue,
  selectedTags,
  sorts,
}) {
  const filteredData = data?.filter(
    (item) =>
      !selectedTags ||
      selectedTags?.length === 0 ||
      selectedTags?.includes(item.tags)
  );

  const sortedData = filteredData?.sort((a, b) => {
    for (const sort of sorts ?? []) {
      if (sort && a[sort.column] < b[sort.column]) {
        return sort.direction === "asc" ? -1 : 1;
      }
      if (sort && a[sort.column] > b[sort.column]) {
        return sort.direction === "asc" ? 1 : -1;
      }
    }
    return 0;
  });

  return (
    <Box>
      <SimpleGrid columns={[2, null, 3]} minChildWidth="250px" gap={5}>
        {sortedData
          ?.filter(
            (row) =>
              typeof searchValue !== "undefined" &&
              ((row.modelName &&
                row.modelName
                  .toString()
                  .toLowerCase()
                  .includes(searchValue.toString().toLocaleLowerCase())) ||
                (row.creator &&
                  row.creator
                    .toString()
                    .toLowerCase()
                    .includes(searchValue.toString().toLocaleLowerCase())) ||
                (row.description &&
                  row.description
                    .toString()
                    .toLowerCase()
                    .includes(searchValue.toString().toLocaleLowerCase())) ||
                (row.tags &&
                  row.tags
                    .toString()
                    .toLowerCase()
                    .includes(searchValue.toString().toLocaleLowerCase())))
          )
          .map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
      </SimpleGrid>
    </Box>
  );
}
