import React, { useEffect, useState, useCallback } from "react";

import styles from "../styles/table/tableStyles.module.css";
import PreviewImage from "./PreviewImage";
import SortableTableHeader from "./SortableTableHeader";

import {
  Table,
  Skeleton,
  Thead,
  Tbody,
  Tr,
  Th,
  useMediaQuery,
  Td,
  Input,
  Button,
  Text,
  Checkbox,
  TableContainer,
  Box,
  Tag,
  Link,
  Stack,
  Select,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";

import supabase from "../utils/supabaseClient";
import Pagination from "./Pagination.js";
import ActiveTagFilters from "./tableControls/ActiveTagFilters";
import { toTitleCase } from "@/utils/toTitleCase";
import { formatLargeNumber } from "@/utils/formatLargeNumber";

const ModelsTable = ({ pageSize = 8 }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [compareMode, setCompareMode] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [isMobile] = useMediaQuery("(max-width: 480px)");
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const fetchTags = useCallback(async () => {
    const { data: tagData } = await supabase
      .from("combinedModelsData")
      .select("tags");

    let tags = [];
    tagData.forEach((item) => {
      if (item.tags) {
        const itemTags = item.tags.split(",");
        tags = [...tags, ...itemTags];
      }
    });
    const uniqueTags = [...new Set(tags)]; // Remove duplicates from array
    setAllTags(uniqueTags);
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const fetchData = useCallback(
    async (ids = null) => {
      setLoading(true);
      let query = supabase
        .from("combinedModelsData")
        .select(
          "modelName, id, description, creator, platform, example, tags, runs, costToRun",
          {
            count: "exact",
          }
        ); // get the total count of rows

      // If ids are provided, fetch only these ids
      if (ids) {
        query = query.in("id", ids);
      } else {
        // Apply filters
        if (activeFilters.length > 0) {
          const tagFilters = activeFilters
            .map((tag) => `tags.ilike.%${tag}%`)
            .join(",");
          query = query.or(tagFilters);
        }

        // Apply search
        if (searchQuery) {
          const formattedSearchQuery = searchQuery
            .split(/\s+/) // split by whitespace
            .map((word) => `'${word}'`) // wrap each word with quotes
            .join(" & "); // join words with '&'
          query = query.filter("searchText", "fts", formattedSearchQuery);
        }

        // If a sort column is specified, sort the data
        if (sortColumn) {
          query = query.order(sortColumn, {
            ascending: sortOrder === "asc",
            nullsFirst: false,
          });
        }
      }

      const { count, data: fullData, error } = await query;
      if (error) throw error;

      // Paginate the data
      const data = ids
        ? fullData
        : fullData.slice((page - 1) * pageSize, page * pageSize);

      setData(data);
      setTotalCount(count); // set the total count
      setLoading(false);
    },
    [page, pageSize, searchQuery, activeFilters, sortColumn, sortOrder]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const handleSort = (column) => {
    // If the user clicks on the column that is currently sorted,
    // toggle the sort order. Otherwise, start sorting by the new column in ascending order.
    const newSortOrder =
      sortColumn === column ? (sortOrder === "asc" ? "desc" : "asc") : "desc";
    setSortColumn(column);
    setSortOrder(newSortOrder);
  };

  // Add onClick event to tag to filter by that tag
  const handleTagClick = (tag) => {
    if (activeFilters.includes(tag)) {
      setActiveFilters(activeFilters.filter((activeTag) => activeTag !== tag));
    } else {
      setActiveFilters([...activeFilters, tag]);
    }
    setPage(1);
  };

  // Add function to clear all active filters
  const handleClearFilters = () => {
    setActiveFilters([]);
  };

  const handleCheckboxChange = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleCompare = () => {
    fetchData(selectedIds);
    setCompareMode(true);
    setPage(1);
  };

  const handleClearCompare = () => {
    setSelectedIds([]);
    setCompareMode(false);
    fetchData();
    setPage(1);
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
      </Box>

      <Stack
        direction={{ base: "column", sm: "row" }} // stack vertically on mobile, horizontally otherwise
        spacing={3} // replace ml={3} with spacing={3} to apply to all children
        align="center" // to align the buttons in center
      >
        {!compareMode && selectedIds.length == 0 && (
          <Button isDisabled>No comparison selected</Button>
        )}

        {!compareMode && selectedIds.length > 0 && (
          <Button onClick={handleCompare} colorScheme="blue">
            Compare {selectedIds.length} models
          </Button>
        )}
        {compareMode && (
          <Button onClick={handleClearCompare} colorScheme="red">
            Clear Comparison
          </Button>
        )}

        {activeFilters.length == 0 && (
          <Button isDisabled>No tag selected</Button>
        )}
        {activeFilters.length > 0 && (
          <Button onClick={handleClearFilters} colorScheme="red">
            Clear {activeFilters.length} tag filter(s)
          </Button>
        )}
        <Menu closeOnSelect={false}>
          <MenuButton as={Button} colorScheme="blue">
            Select tag(s)
          </MenuButton>
          <MenuList
            minWidth="240px"
            maxHeight="400px"
            overflowY="auto"
            zIndex={9999}
          >
            {allTags.map((tag) => (
              <MenuItem key={tag}>
                <Checkbox
                  isChecked={activeFilters.includes(tag)}
                  onChange={() => handleTagClick(tag)}
                >
                  {tag}
                </Checkbox>
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </Stack>

      <TableContainer overflowY="auto" my={5} borderRadius="5px">
        <Table
          style={{ tableLayout: "fixed" }}
          className={styles.paginatedTable}
          size="md"
          borderRadius="5px"
        >
          <Thead
            position="sticky"
            top={0}
            bgColor="gray.300"
            zIndex={999}
            overflowY="none"
          >
            <Tr>
              <Th width="2ch">
                {selectedIds.length > 0 ? (
                  <Checkbox isIndeterminate onChange={handleClearCompare} />
                ) : (
                  <Checkbox isDisabled defaultChecked isReadOnly />
                )}
              </Th>
              {!isMobile && (
                <SortableTableHeader
                  column="creator"
                  displayName="Creator"
                  width="140px"
                  sortColumn={sortColumn}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
              )}
              <SortableTableHeader
                column="modelName"
                displayName="Model"
                width={isMobile ? "110px" : "180px"}
                sortColumn={sortColumn}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
              <SortableTableHeader
                column="description"
                displayName="Description"
                width={isMobile ? "120px" : "180px"}
                sortColumn={sortColumn}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
              <SortableTableHeader
                column="example"
                displayName="Example"
                width="200px"
                sortColumn={sortColumn}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
              {!isMobile && (
                <SortableTableHeader
                  column="platform"
                  displayName="Platform"
                  width={isMobile ? "100px" : "180px"}
                  sortColumn={sortColumn}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
              )}
              <SortableTableHeader
                column="tags"
                displayName="Tags"
                width={isMobile ? "200px" : "200px"}
                sortColumn={sortColumn}
                sortOrder={sortOrder}
                onSort={handleSort}
                isTruncated
              />
              <SortableTableHeader
                column="runs"
                displayName="Runs"
                isNumeric="true"
                width={isMobile ? "100px" : "100px"}
                sortColumn={sortColumn}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
              <SortableTableHeader
                column="costToRun"
                displayName="$/Run"
                width={isMobile ? "100px" : "120px"}
                sortColumn={sortColumn}
                sortOrder={sortOrder}
                onSort={handleSort}
                isNumeric="true"
              />
            </Tr>
          </Thead>
          <Tbody>
            {data.length > 0 ? (
              data.map((item) => (
                <Tr key={item.id}>
                  <Td>
                    <Checkbox
                      onChange={() => handleCheckboxChange(item.id)}
                      isChecked={selectedIds.includes(item.id)}
                    />
                  </Td>

                  {!isMobile && (
                    <Td
                      maxW={isMobile ? "120px" : "100px"}
                      style={{ whiteSpace: "normal", wordWrap: "break-word" }}
                      isTruncated
                    >
                      <Text noOfLines={1}>
                        <Link
                          href={`/creators/${item?.platform}/${item?.creator}`}
                          color="teal"
                          textDecoration="underline"
                        >
                          {item?.creator}
                        </Link>
                      </Text>
                    </Td>
                  )}
                  <Td
                    style={{ whiteSpace: "normal", wordWrap: "break-word" }}
                    maxW={isMobile ? "110px" : "180px"}
                    isTruncated
                  >
                    <Text noOfLines={1}>
                      <Link
                        href={`/models/${item?.platform}/${item?.id}`}
                        color="teal"
                        textDecoration="underline"
                      >
                        {item?.modelName}
                      </Link>
                    </Text>
                  </Td>
                  <Td
                    style={{ whiteSpace: "normal", wordWrap: "break-word" }}
                    maxW={isMobile ? "110px" : "180px"}
                    isTruncated
                  >
                    <Text noOfLines={3}>{item?.description}</Text>
                  </Td>
                  <Td width="160px">
                    <Box width="160px" height="90px" overflow="hidden">
                      <Link
                        href={`/models/${item?.platform}/${item?.id}`}
                        color="teal"
                        textDecoration="underline"
                      >
                        <PreviewImage src={item?.example ? item.example : ""} />
                      </Link>
                    </Box>
                  </Td>
                  {!isMobile && <Td>{toTitleCase(item.platform)}</Td>}
                  <Td
                    maxW={isMobile ? "120px" : "120px"}
                    style={{
                      wordWrap: "break-word",
                    }}
                  >
                    {item?.tags?.split(",").map((tag) => (
                      <Text
                        key={tag}
                        as="span"
                        onClick={() => handleTagClick(tag)}
                      >
                        <Tag
                          _hover={{
                            cursor: "pointer",
                            backgroundColor: "gray.300",
                          }}
                          _active={{
                            backgroundColor: "gray.400",
                          }}
                        >
                          <span
                            maxW={isMobile ? "140px" : "140px"}
                            style={{
                              wordWrap: "break-word",
                              whiteSpace: "nowrap",
                              textOverflow: "ellipsis",
                              overflow: "hidden",
                            }}
                          >
                            {tag}
                          </span>
                        </Tag>
                      </Text>
                    ))}
                  </Td>
                  <Td maxW={isMobile ? "100px" : "120px"} isNumeric>
                    {item.runs !== null ? formatLargeNumber(item.runs) : "-"}
                  </Td>
                  <Td maxW={isMobile ? "200px" : "220px"} isNumeric>
                    ${item.costToRun ? item.costToRun : " -"}
                  </Td>
                </Tr>
              ))
            ) : loading ? (
              [...Array(10)].map((_, i) => (
                <Tr key={i}>
                  <Td>
                    <Skeleton height="20px" />
                  </Td>
                  <Td>
                    <Skeleton height="20px" />
                  </Td>

                  <Td>
                    <Skeleton height="20px" />
                  </Td>

                  <Td>
                    <Skeleton height="20px" />
                  </Td>
                  <Td>
                    <Skeleton height="64px" width="160px" />
                  </Td>
                  <Td>
                    <Skeleton height="20px" />
                  </Td>
                  <Td>
                    <Skeleton height="20px" />
                  </Td>
                  <Td>
                    <Skeleton height="20px" />
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={isMobile ? 1 : 9} height="200px">
                  <Text textAlign="center" color="gray.500">
                    No models found - try changing your search!
                  </Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
      <Pagination
        totalCount={totalCount}
        pageSize={pageSize}
        currentPage={page}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </>
  );
};

export default ModelsTable;
