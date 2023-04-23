import { useEffect, useRef, useState } from "react";
import { fetchRunsHistoryByModelId } from "../../utils/supabaseClient";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns"; // Import the date-fns adapter
import { Heading, Text, Box } from "@chakra-ui/react";

// Register required controllers, elements, and scales
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale
);

const TrendingModelsChart = ({ modelIds }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const prepareChartData = async () => {
      const datasets = await Promise.all(
        modelIds.map(async (modelId) => {
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

          return {
            modelId,
            label: `Model ${modelId}`,
            data,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: `#${Math.floor(Math.random() * 16777215).toString(
              16
            )}`,
            borderWidth: 1,
            pointRadius: 2,
          };
        })
      );

      setChartData({
        datasets: datasets.filter(Boolean),
      });
    };

    prepareChartData();
  }, [modelIds]);

  useEffect(() => {
    if (!chartRef.current || !chartData) {
      return;
    }

    const chartOptions = {
      scales: {
        x: {
          type: "time",
          adapters: {
            date: "date-fns",
          },
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
          position: "top", // Change the position of the legend as needed
        },
      },
    };

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(chartRef.current, {
      type: "line",
      data: chartData,
      options: chartOptions,
    });

    return () => {
      // Clean up the chart instance on component unmount
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [chartData]);

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
        <Box p={5} maxH="250px">
          <canvas ref={chartRef} style={{ width: "100%", height: "200px" }} />
        </Box>
      </Box>
    </>
  );
};

export default TrendingModelsChart;
