import React, { useState } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Box,
  Button,
} from "@chakra-ui/react";
import supabase from "../utils/supabaseClient";
import synonyms from "synonyms";

const ModelMatchmaker = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const expandWordWithSynonyms = (word) => {
    const synonymsList = (synonyms(word) || {}).n || []; // Use noun synonyms for simplicity; adjust as needed.
    const allWords = [word, ...synonymsList];
    return `(${allWords.map((w) => `'${w}'`).join(" | ")})`;
  };

  const expandQueryWithSynonyms = (query) => {
    return query.split(/\s+/).map(expandWordWithSynonyms).join(" & ");
  };

  const fetchData = async () => {
    setLoading(true);

    let query = supabase
      .from("combinedModelsData")
      .select(
        "modelName, id, description, tags, runs, costToRun, generatedUseCase, generatedSummary"
      )
      .order("runs", { ascending: false })
      .limit(7);

    if (searchQuery) {
      const expandedQuery = expandQueryWithSynonyms(searchQuery);
      console.log("Expanded Query:", expandedQuery);
      query = query.filter("searchText", "fts", expandedQuery);
    }

    const { data: modelsData, error } = await query;
    if (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
      return;
    }

    setData(modelsData);
    setLoading(false);
  };

  const handleSearchClick = () => {
    fetchData();
  };

  return (
    <>
      <Box my={5}>
        <Input
          type="text"
          placeholder="Search by model (Ex: stable diffusion) or use case (Ex: upscaler)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button ml={2} onClick={handleSearchClick} colorScheme="blue">
          Search
        </Button>
      </Box>
      <Table>
        <Thead>
          <Tr>
            <Th>Model Name</Th>
            <Th>Summary</Th>
            <Th>Use case</Th>
            <Th>Tags</Th>
            <Th>Runs</Th>
            <Th>$/Run</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.length > 0 ? (
            data.map((item) => (
              <Tr key={item.id}>
                <Td>{item.modelName}</Td>
                <Td>{item.generatedSummary}</Td>
                <Td>{item.generatedUseCase}</Td>
                <Td>{item.tags}</Td>
                <Td>{item.runs !== null ? item.runs.toLocaleString() : "-"}</Td>
                <Td>${item.costToRun ? item.costToRun.toFixed(2) : "-"}</Td>
              </Tr>
            ))
          ) : loading ? (
            <Tr>
              <Td colSpan={5}>Loading...</Td>
            </Tr>
          ) : (
            <Tr>
              <Td colSpan={5}>No models found - try changing your search!</Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </>
  );
};

export default ModelMatchmaker;
