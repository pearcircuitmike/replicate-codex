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
} from "@chakra-ui/react";
import Link from "next/link";
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { colors } from "../../styles/colors";
import { GrAscend, GrDescend, GrUnsorted } from "react-icons/gr";

import testData from "../data/data.json";

export default function DataTable() {
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

    if (datatype === "string") {
      if (order === "ASC") {
        const sorted = [...data].sort((a, b) =>
          a[col].toLowerCase() > b[col].toLowerCase() ? 1 : -1
        );
        setData(sorted);
        setOrder("DSC");
      }
      if (order === "DSC") {
        const sorted = [...data].sort((a, b) =>
          a[col].toLowerCase() < b[col].toLowerCase() ? 1 : -1
        );
        setData(sorted);
        setOrder("ASC");
      }
    }
    if (datatype === "float") {
      if (order === "ASC") {
        const sorted = [...data].sort((a, b) =>
          parseFloat(a[col]) > parseFloat(b[col]) ? 1 : -1
        );
        setData(sorted);
        setOrder("DSC");
      }
      if (order === "DSC") {
        const sorted = [...data].sort((a, b) =>
          parseFloat(a[col]) < parseFloat(b[col]) ? 1 : -1
        );
        setData(sorted);
        setOrder("ASC");
      }
    }
  };

  return (
    <TableContainer maxHeight={600} overflowY="auto">
      <Table size="sm">
        <Thead position="sticky" top={0} bgColor="white">
          <Tr>
            <Th
              maxWidth={75}
              isTruncated
              onClick={() => sorting("modelName", "string")}
            >
              Last Updated{" "}
              {order === "ASC" && sortedCol === "modelName" && (
                <GrAscend style={{ display: "inline" }} />
              )}
              {order === "DSC" && sortedCol === "modelName" && (
                <GrDescend style={{ display: "inline" }} />
              )}
            </Th>
            <Th onClick={() => sorting("creator", "string")}>
              Creator{" "}
              {order === "ASC" && sortedCol === "creator" && (
                <GrAscend style={{ display: "inline" }} />
              )}
              {order === "DSC" && sortedCol === "creator" && (
                <GrDescend style={{ display: "inline" }} />
              )}
            </Th>
            <Th onClick={() => sorting("modelName", "string")}>
              Model Name
              {order === "ASC" && sortedCol === "modelName" && (
                <GrAscend style={{ display: "inline" }} />
              )}
              {order === "DSC" && sortedCol === "modelName" && (
                <GrDescend style={{ display: "inline" }} />
              )}
            </Th>
            <Th onClick={() => sorting("description", "string")}>
              Description
              {order === "ASC" && sortedCol === "description" && (
                <GrAscend style={{ display: "inline" }} />
              )}
              {order === "DSC" && sortedCol === "description" && (
                <GrDescend style={{ display: "inline" }} />
              )}
            </Th>
            <Th onClick={() => sorting("tags", "string")}>
              Tags
              {order === "ASC" && sortedCol === "tags" && (
                <GrAscend style={{ display: "inline" }} />
              )}
              {order === "DSC" && sortedCol === "tags" && (
                <GrDescend style={{ display: "inline" }} />
              )}
            </Th>
            <Th onClick={() => sorting("example", "string")}>
              Example
              {order === "ASC" && sortedCol === "example" && (
                <GrAscend style={{ display: "inline" }} />
              )}
              {order === "DSC" && sortedCol === "example" && (
                <GrDescend style={{ display: "inline" }} />
              )}
            </Th>
            <Th onClick={() => sorting("modelUrl", "string")}>
              Replicate Url
              {order === "ASC" && sortedCol === "modelUrl" && (
                <GrAscend style={{ display: "inline" }} />
              )}
              {order === "DSC" && sortedCol === "modelUrl" && (
                <GrDescend style={{ display: "inline" }} />
              )}
            </Th>
            <Th onClick={() => sorting("runs", "float")}>
              Runs
              {order === "ASC" && sortedCol === "runs" && (
                <GrAscend style={{ display: "inline" }} />
              )}
              {order === "DSC" && sortedCol === "runs" && (
                <GrDescend style={{ display: "inline" }} />
              )}
            </Th>
            <Th onClick={() => sorting("costToRun", "float")}>
              Cost to Run
              {order === "ASC" && sortedCol === "costToRun" && (
                <GrAscend style={{ display: "inline" }} />
              )}
              {order === "DSC" && sortedCol === "costToRun" && (
                <GrDescend style={{ display: "inline" }} />
              )}
            </Th>
          </Tr>
        </Thead>
        <Tbody whiteSpace="normal">
          {data &&
            data.map(
              ({
                lastUpdated,
                creator,
                modelName,
                description,
                tags,
                example,
                modelUrl,
                runs,
                costToRun,
                id,
              }) => (
                <Tr key={id} style={{ verticalAlign: "top" }}>
                  <Td>{lastUpdated}</Td>
                  <Td>
                    <a
                      href={`https://cnn.com`}
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
                  <Td minWidth="180px">
                    <Tag colorScheme="gray">{tags}</Tag>
                  </Td>
                  <Td>
                    <Image src={example} boxSize="40px" />
                  </Td>
                  <Td maxWidth="50px">
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
                  <Td isNumeric>{runs.toLocaleString()}</Td>
                  <Td isNumeric>{costToRun.toLocaleString()}</Td>
                </Tr>
              )
            )}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
