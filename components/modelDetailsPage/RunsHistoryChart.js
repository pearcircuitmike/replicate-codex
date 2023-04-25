import { useEffect, useRef } from "react";
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
import { Heading, Text, Box, VStack } from "@chakra-ui/react";

// Register required controllers, elements, and scales
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale
);

const RunsHistoryChart = ({ modelId }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const prepareChartData = async () => {
      const runsHistory = await fetchRunsHistoryByModelId(modelId);

      if (!runsHistory || runsHistory.length === 0) {
        console.warn("No runs history data available");
        return;
      }

      const labels = runsHistory.map((entry) => entry.timestamp);
      const data = runsHistory.map((entry) => entry.runs);

      const chartData = {
        labels,
        datasets: [
          {
            label: "Runs",
            data,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "#3182CE",
            borderWidth: 1,
          },
        ],
      };

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      if (chartRef && chartRef.current) {
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
        };

        chartInstanceRef.current = new Chart(chartRef.current, {
          type: "line",
          data: chartData,
          options: {
            ...chartOptions,
            responsive: true,
            maintainAspectRatio: false,
          },
        });
      }
    };

    prepareChartData();

    return () => {
      // Clean up the chart instance on component unmount
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [modelId]);

  return (
    <>
      <Box mt={10}>
        <Heading as="h2" size="sm">
          Runs over time
        </Heading>
        <Text my={5}>
          This chart displays the number of runs over time for the selected
          model.
        </Text>
        <Box p={5} maxH="250px">
          <canvas ref={chartRef} style={{ width: "100%", height: "200px" }} />
        </Box>
      </Box>
    </>
  );
};

export default RunsHistoryChart;
