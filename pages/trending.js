import { useState, useEffect } from "react";
import { useRouter } from "next/router";
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
  const router = useRouter();
  const [models, setModels] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    async function fetchTags() {
      const tags = await fetchAllTags("replicateModelsData");
      setAllTags(tags);
    }
    fetchTags();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const topModelIds = await fetchTopModelIds(10, selectedTags);
      const modelDataPromises = topModelIds.map((id) =>
        fetchModelDataById(id, "replicateModelsData")
      );
      const topModels = await Promise.all(modelDataPromises);
      setModels(topModels);
    }
    fetchData();
  }, [selectedTags]);

  useEffect(() => {
    if (router.query.tags) {
      setSelectedTags(JSON.parse(router.query.tags));
    }
  }, [router.query]);

  useEffect(() => {
    const handleRouteChange = (url) => {
      const params = new URLSearchParams(url.split("?")[1]);
      const tags = params.get("tags");
      if (tags) {
        setSelectedTags(JSON.parse(tags));
      }
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router]);

  const handleTagSelection = (values) => {
    setSelectedTags(values);
    const params = new URLSearchParams();
    if (values.length > 0) {
      params.set("tags", JSON.stringify(values));
    }
    router.replace(`/trending?${params.toString()}`, undefined, {
      shallow: true,
      scroll: false,
    });
  };

  const handleTagClose = (tag) => {
    const newSelectedTags = selectedTags.filter((t) => t !== tag);
    handleTagSelection(newSelectedTags);
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

              <TrendingModelsChart modelIds={models.map((model) => model.id)} />

              <TopModelsTable
                models={models}
                selectedTags={selectedTags}
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
