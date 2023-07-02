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
  Container,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import TrendingModelsChart from "../components/TrendingModelsChart";
import TopModelsTable from "../components/TopModelsTable";
import MetaTags from "../components/MetaTags";
import { fetchModelDataById } from "../utils/modelsData.js";
import { fetchAllTags } from "../utils/tags.js";
import { fetchTopModelIds } from "@/utils/fetchTopModelIds";

export default function Trending() {
  const allPlatforms = ["cerebrium", "huggingFace", "replicate", "deepInfra"];

  const [models, setModels] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState(allPlatforms);
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    async function fetchTags() {
      const tags = await fetchAllTags("combinedModelsData");
      setAllTags(tags);
    }
    fetchTags();
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const topModelIds = await fetchTopModelIds(
          10,
          selectedTags,
          selectedPlatforms
        );

        const modelDataPromises = topModelIds.map((id) =>
          fetchModelDataById(id)
        );

        const topModels = await Promise.all(modelDataPromises);
        setModels(topModels);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, [selectedTags, selectedPlatforms]);

  const handleTagSelection = (values) => {
    setSelectedTags(values);
  };

  const handleTagClose = (tag) => {
    const newSelectedTags = selectedTags.filter((t) => t !== tag);
    handleTagSelection(newSelectedTags);
  };

  const handlePlatformSelection = (values) => {
    setSelectedPlatforms(values);
  };

  return (
    <>
      <MetaTags
        title="Trending Models | AIModels.fyi"
        description="Discover the top trending AI models in the world."
      />
      <Container maxW="4xl">
        <Box as="main" p={6}>
          {models && (
            <>
              <Box>
                <Heading as="h3" size="md" mb={2}>
                  Filter by tags:
                </Heading>
                <FormControl>
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
                        onChange={handleTagSelection}
                      >
                        {allTags.map((tag, idx) => (
                          <MenuItemOption key={idx} value={tag}>
                            <Checkbox value={tag}>{tag}</Checkbox>
                          </MenuItemOption>
                        ))}
                      </CheckboxGroup>
                    </MenuList>
                  </Menu>
                </FormControl>
              </Box>

              <Box mt={4}>
                <Heading as="h3" size="md" mb={2}>
                  Filter by platform:
                </Heading>
                <FormControl>
                  <Menu closeOnSelect={false}>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                      Select Platform
                    </MenuButton>
                    <MenuList
                      minWidth="240px"
                      maxHeight="200px"
                      overflowY="auto"
                    >
                      <CheckboxGroup
                        colorScheme="blue"
                        value={selectedPlatforms}
                        onChange={handlePlatformSelection}
                      >
                        {allPlatforms.map((platform) => (
                          <MenuItemOption key={platform} value={platform}>
                            <Checkbox value={platform}>{platform}</Checkbox>
                          </MenuItemOption>
                        ))}
                      </CheckboxGroup>
                    </MenuList>
                  </Menu>
                </FormControl>
              </Box>

              <TrendingModelsChart modelIds={models.map((model) => model.id)} />

              <TopModelsTable
                models={models}
                selectedTags={selectedTags}
                selectedPlatforms={selectedPlatforms}
                onTagClose={handleTagClose}
                onTagsChange={handleTagSelection}
              />
            </>
          )}
        </Box>
      </Container>
    </>
  );
}
