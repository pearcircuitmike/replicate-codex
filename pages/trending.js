import { useState, useEffect } from "react";
import {
  Box,
  CheckboxGroup,
  Checkbox,
  Heading,
  Menu,
  MenuButton,
  Button,
  MenuList,
  MenuItemOption,
  FormControl,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import TrendingModelsChart from "./components/TrendingModelsChart";
import TopModelsTable from "./components/TopModelsTable";
import MetaTags from "./components/MetaTags";
import {
  fetchAllTags,
  fetchFilteredData,
  fetchModelDataById,
} from "../utils/supabaseClient";
import { fetchTopModelIds } from "@/utils/fetchTopModelIds";

export default function Trending() {
  const [models, setModels] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const [allTags, setAllTags] = useState([]);
  useEffect(() => {
    async function fetchTags() {
      const tags = await fetchAllTags();
      setAllTags(tags);
    }

    fetchTags();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const topModelIds = await fetchTopModelIds(10, selectedTags);
      const modelDataPromises = topModelIds.map((id) => fetchModelDataById(id));
      const topModels = await Promise.all(modelDataPromises);

      setModels(topModels);
    }

    fetchData();
  }, [selectedTags]);

  const handleTagClose = (tag) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  return (
    <>
      <MetaTags
        title="Trending Models | Replicate Codex"
        description="Discover the top trending AI models on Replicate Codex."
      />

      <Box as="main" p={6}>
        {models && (
          <>
            <TrendingModelsChart modelIds={models.map((model) => model.id)} />
            <Box>
              <Heading as="h3" size="md" mb={2}>
                Filter by tags:
              </Heading>
              <FormControl>
                <Box position="relative">
                  <Menu closeOnSelect={false}>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                      Select Tags
                    </MenuButton>
                    <MenuList
                      minWidth="240px"
                      maxHeight="200px"
                      overflowY="auto"
                    >
                      <CheckboxGroup
                        colorScheme="blue"
                        value={selectedTags}
                        onChange={(values) => setSelectedTags(values)}
                      >
                        {allTags.map((tag, idx) => (
                          <MenuItemOption key={idx} value={tag}>
                            <Checkbox value={tag}>{tag}</Checkbox>
                          </MenuItemOption>
                        ))}
                      </CheckboxGroup>
                    </MenuList>
                  </Menu>
                </Box>
              </FormControl>
            </Box>

            <TopModelsTable
              models={models}
              selectedTags={selectedTags}
              onTagClose={handleTagClose}
              onTagsChange={setSelectedTags}
            />
          </>
        )}
      </Box>
    </>
  );
}
