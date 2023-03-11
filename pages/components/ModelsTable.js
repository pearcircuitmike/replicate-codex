import * as React from "react";
import { useState, useEffect } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Image,
  Text,
  Box,
  Tag,
  Input,
  Center,
} from "@chakra-ui/react";
import Link from "next/link";
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { colors } from "../../styles/colors";
import { GrAscend, GrDescend, GrUnsorted } from "react-icons/gr";

import testData from "../data/data.json";

export default function DataTable({ searchedVal }) {
  const [data, setData] = useState([]);
  const [didLoad, setDidLoad] = useState(false);
  const [order, setOrder] = useState("DSC");
  const [sortedCol, setSortedCol] = useState("location");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const modelsUrl = "../data/data.json";
        // const modelsRes = await fetch(modelsUrl);
        //  const modelsData = await modelsRes.json();
        const modelsData = testData;

        console.log(modelsData);

        const sortedArray = modelsData.sort(
          (a, b) =>
            new Date(b.modelName).getTime() - new Date(a.modelName).getTime()
        );

        const unique = sortedArray
          .map((e) => e["id"])

          // store the keys of the unique objects
          .map((e, i, final) => final.indexOf(e) === i && i)

          // eliminate the dead keys & store unique objects
          .filter((e) => sortedArray[e])
          .map((e) => sortedArray[e]);

        const uniqueSortedAlpha = unique.sort((a, b) => {
          var modelNameA = a.modelName.toLowerCase(),
            modelNameB = b.modelName.toLowerCase();
          if (modelNameA < modelNameB)
            //sort string ascending
            return -1;
          if (modelNameA > modelNameB) return 1;
          return 0; //default return value (no sorting)
        });
        setData(uniqueSortedAlpha);

        setDidLoad(true);
      } catch (error) {
        console.log("error", error);
      }
    };
    if (!didLoad) {
      fetchData();
    }
  }, []);

  const sorting = (col, datatype) => {
    setSortedCol(col);
    const sortOrder = order === "ASC" ? 1 : -1;

    const sorted = [...data].sort((a, b) => {
      let compareValue = 0;
      if (datatype === "string") {
        compareValue = a[col].toLowerCase().localeCompare(b[col].toLowerCase());
      } else if (datatype === "float") {
        compareValue = a[col] - b[col];
      }
      return compareValue * sortOrder;
    });

    setData(sorted);
    setOrder(order === "ASC" ? "DSC" : "ASC");
  };

  const columns = [
    {
      key: "creator",
      label: "Creator",
      type: "string",
      render: (val) => (
        <a
          href={`https://cnn.com`}
          style={{ color: "teal", textDecoration: "underline" }}
        >
          {val}
        </a>
      ),
    },
    {
      key: "modelName",
      label: "Model Name",
      type: "string",
      maxWidth: 50,
      isTruncated: true,
    },
    {
      key: "description",
      label: "Description",
      type: "string",
      maxWidth: "200px",
      render: (val) => (
        <Box maxHeight="100px">
          <Text noOfLines={[1, 2, 5]}>{val}</Text>
        </Box>
      ),
    },
    { key: "tags", label: "Tags", type: "string" },
    { key: "example", label: "Example", type: "string" },
    { key: "modelUrl", label: "Replicate Url", type: "string" },
    { key: "runs", label: "Runs", type: "float" },
    { key: "costToRun", label: "Cost to Run", type: "float" },
    { key: "lastUpdated", label: "Last Updated", type: "string" },
  ];

  return (
    <>
      <TableContainer maxHeight={600} overflowY="auto">
        <Table size="sm">
          <Thead position="sticky" top={0} bgColor="white">
            <Tr>
              {columns.map((col) => (
                <Th key={col.key} onClick={() => sorting(col.key, col.type)}>
                  {col.label}
                  {order === "ASC" && sortedCol === col.key && (
                    <GrAscend style={{ display: "inline" }} />
                  )}
                  {order === "DSC" && sortedCol === col.key && (
                    <GrDescend style={{ display: "inline" }} />
                  )}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody whiteSpace="normal">
            {data &&
              data
                .filter(
                  (row) =>
                    !searchedVal.length ||
                    row.modelName
                      .toString()
                      .toLowerCase()
                      .includes(searchedVal.toString().toLocaleLowerCase()) ||
                    row.creator
                      .toString()
                      .toLowerCase()
                      .includes(searchedVal.toString().toLocaleLowerCase()) ||
                    row.description
                      .toString()
                      .toLowerCase()
                      .includes(searchedVal.toString().toLocaleLowerCase()) ||
                    row.tags
                      .toString()
                      .toLowerCase()
                      .includes(searchedVal.toString().toLocaleLowerCase())
                )
                .map(
                  ({
                    creator,
                    modelName,
                    description,
                    tags,
                    example,
                    modelUrl,
                    runs,
                    costToRun,
                    id,
                    lastUpdated,
                  }) => (
                    <Tr key={id} style={{ verticalAlign: "top" }}>
                      <Td>
                        <a
                          href={`/creators/${creator}`}
                          style={{
                            color: "teal",
                            textDecoration: "underline",
                          }}
                        >
                          {creator}
                        </a>
                      </Td>
                      <Td maxWidth={50} isTruncated>
                        {modelName}
                      </Td>
                      <Td maxWidth="200px">
                        <Box maxHeight="100px">
                          <Text noOfLines={[1, 2, 5]}>{description}</Text>
                        </Box>
                      </Td>
                      <Td minW="180px">
                        <Tag>{tags}</Tag>
                      </Td>
                      <Td>
                        {example && (
                          <img
                            src={example}
                            alt="example"
                            style={{
                              width: "64px",
                              height: "64px",
                              objectFit: "cover",
                            }}
                          />
                        )}
                      </Td>
                      <Td>
                        <Link
                          href={modelUrl}
                          style={{
                            color: "teal",
                            textDecoration: "underline",
                          }}
                        >
                          {modelUrl}
                        </Link>
                      </Td>
                      <Td>{runs}</Td>
                      <Td>{costToRun}</Td>
                      <Td>{lastUpdated}</Td>
                    </Tr>
                  )
                )}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
}
