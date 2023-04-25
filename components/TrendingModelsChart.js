import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  LineElement, // Import LineElement
  PointElement,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";

import { fetchRunsHistoryByModelId } from "../utils/supabaseClient";
import { fetchModelDataById } from "../utils/supabaseClient";
import { Heading, Text, Box, useTheme, useToken } from "@chakra-ui/react";
import "chartjs-adapter-date-fns";

// Register the required plugins
ChartJS.register(
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  TimeScale
);

const TrendingModelsChart = ({ modelIds }) => {
  const [chartData, setChartData] = useState(null);
  const theme = useTheme();

  // Define Chakra UI preset theme colors
  const colors = [
    "red.500",
    "yellow.500",
    "green.500",
    "blue.500",
    "cyan.500",
    "teal.500",
    "purple.500",
    "pink.500",
    "orange.500",
    "indigo.500",
  ];
  // Use the useToken hook to access the color values from the theme
  const presetColors = useToken("colors", colors);
  // Shuffle the presetColors array to randomize the color order
  // presetColors.sort(() => Math.random() - 0.5);

  useEffect(() => {
    const prepareChartData = async () => {
      const datasets = await Promise.all(
        modelIds?.map(async (modelId, index) => {
          const modelData = await fetchModelDataById(modelId);

          const runsHistory = await fetchRunsHistoryByModelId(modelId);

          if (!runsHistory || runsHistory.length === 0) {
            console.warn(
              `No runs history data available for modelId: ${modelId}`
            );
            return null;
          }

          const data = runsHistory.map((entry) => ({
            x: entry.timestamp,
            y: entry.runs,
          }));

          // Use a color from the shuffled array, ensuring it's unique
          const color = presetColors[index]; // Assign a unique color from the shuffled array

          // Use the modelName property instead of modelId for the label
          const modelName = modelData?.modelName || `Model ${modelId}`;

          return {
            modelId,
            label: ` ${modelName}`,
            data,
            backgroundColor: color,
            borderColor: color,
            borderWidth: 2,
            pointRadius: 3,
          };
        })
      );

      setChartData({
        datasets: datasets.filter(Boolean),
      });
    };

    prepareChartData();
  }, [modelIds]);

  const chartOptions = {
    scales: {
      x: {
        type: "time",
        time: {
          unit: "day",
        },
      },
      y: {
        beginAtZero: true,
      },
    },
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },
  };

  return (
    <>
      <Box mt={10}>
        <Heading as="h2" size="sm">
          Trending Models Runs History
        </Heading>
        <Text my={5}>
          This chart displays the number of runs over time for the top 10
          trending models.
        </Text>
        <Box p={5} minH="400px">
          {chartData && <Line data={chartData} options={chartOptions} />}
        </Box>
      </Box>
    </>
  );
};

export default TrendingModelsChart;
