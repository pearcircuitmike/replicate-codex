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
} from "@chakra-ui/react";
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { colors } from "../../styles/colors";
import { GrAscend, GrDescend, GrUnsorted } from "react-icons/gr";

export default function DataTable() {
  const [data, setData] = useState([]);
  const [didLoad, setDidLoad] = useState(false);
  const [order, setOrder] = useState("DSC");
  const [sortedCol, setSortedCol] = useState("location");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const modelsUrl = "https://jsonplaceholder.typicode.com/todos";
        const modelsRes = await fetch(modelsUrl);
        const modelsData = await modelsRes.json();
        console.log(modelsData);

        const sortedArray = modelsData.sort(
          (a, b) => new Date(b.title).getTime() - new Date(a.title).getTime()
        );

        const unique = sortedArray
          .map((e) => e["id"])

          // store the keys of the unique objects
          .map((e, i, final) => final.indexOf(e) === i && i)

          // eliminate the dead keys & store unique objects
          .filter((e) => sortedArray[e])
          .map((e) => sortedArray[e]);

        const uniqueSortedAlpha = unique.sort((a, b) => {
          var titleA = a.title.toLowerCase(),
            titleB = b.title.toLowerCase();
          if (titleA < titleB)
            //sort string ascending
            return -1;
          if (titleA > titleB) return 1;
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
    <TableContainer maxHeight={400} overflowY="auto">
      <Table size="sm">
        <Thead position="sticky" top={0} bgColor="white">
          <Tr>
            <Th onClick={() => sorting("title", "string")}>
              Desc{" "}
              {order === "ASC" && sortedCol === "title" && (
                <GrAscend style={{ display: "inline" }} />
              )}
              {order === "DSC" && sortedCol === "title" && (
                <GrDescend style={{ display: "inline" }} />
              )}
            </Th>
            <Th onClick={() => sorting("id", "float")}>
              id
              {order === "ASC" && sortedCol === "id" && (
                <GrAscend style={{ display: "inline" }} />
              )}
              {order === "DSC" && sortedCol === "id" && (
                <GrDescend style={{ display: "inline" }} />
              )}
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {data &&
            data.map(({ title, id }) => (
              <Tr key={id}>
                <Td>
                  <a
                    href={`https://cnn.com`}
                    style={{
                      color: `${colors.blueMunsell}`,
                      textDecoration: "underline",
                    }}
                  >
                    {title}
                  </a>
                </Td>
                <Td>{parseInt(id).toLocaleString()}</Td>
              </Tr>
            ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
