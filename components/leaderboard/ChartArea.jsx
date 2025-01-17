// components/leaderboard/ChartArea.jsx

import React, { useEffect, useState } from "react";
import { Box, Heading, Text, Spinner, useTheme } from "@chakra-ui/react";
import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Line,
} from "recharts";
import { daysAgo } from "./dataHelpers";
import { formatLargeNumber } from "./utils";

export default function ChartArea({
  tabIndex = 0,
  topTen10d = [],
  topTenRising = [],
  allTimeTop = [],
  allStats = {},
}) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  // If you want to highlight a single line on legend hover:
  const [hoveredLine, setHoveredLine] = useState(null);

  // Use Chakra’s theme for brand colors
  const theme = useTheme();
  const chakraColors = [
    theme.colors.blue[500],
    theme.colors.green[500],
    theme.colors.red[500],
    theme.colors.orange[500],
    theme.colors.purple[500],
    theme.colors.pink[500],
    theme.colors.teal[500],
    theme.colors.cyan[500],
    theme.colors.yellow[500],
    theme.colors.gray[500],
  ];

  // Decide chart heading based on tab
  const tabHeadings = ["Last 10 Days", "Rising Stars", "All-Time"];
  const chartHeading = tabHeadings[tabIndex] || "Leaderboard";

  // Build chart data depending on tab
  useEffect(() => {
    setLoading(true);
    let selectedModels;
    if (tabIndex === 0) {
      selectedModels = topTen10d;
    } else if (tabIndex === 1) {
      selectedModels = topTenRising;
    } else {
      selectedModels = allTimeTop;
    }

    const newData = buildChartDataLastTenDays(selectedModels, allStats);
    setChartData(newData);
    setLoading(false);
  }, [tabIndex, topTen10d, topTenRising, allTimeTop, allStats]);

  // Custom tooltip for hover formatting
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <Box bg="gray.50" borderWidth="1px" borderRadius="md" p={2}>
        <Text fontWeight="bold" mb={1}>
          {label}
        </Text>
        {payload.map((pl) => (
          <Text key={pl.dataKey} color={pl.color} fontSize="sm">
            {pl.dataKey}: {formatLargeNumber(pl.value)}
          </Text>
        ))}
      </Box>
    );
  };

  // Legend hover handlers
  const handleLegendMouseEnter = (o) => {
    if (o && o.dataKey) setHoveredLine(o.dataKey);
  };
  const handleLegendMouseLeave = () => {
    setHoveredLine(null);
  };

  return (
    <Box mb={8} border="1px solid #ddd" borderRadius="md" p={4}>
      <Heading size="md" mb={2}>
        Leaderboard: {chartHeading} Graph
      </Heading>
      <Text mb={4} fontSize="sm" color="gray.600">
        This chart shows daily runs for the top-10 models in the "{chartHeading}
        " list
      </Text>

      {loading ? (
        <Spinner />
      ) : chartData.length === 0 ? (
        <Text fontStyle="italic">No chart data available.</Text>
      ) : (
        <Box width="100%" height="400px">
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              onMouseLeave={() => setHoveredLine(null)}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} tickFormatter={formatLargeNumber} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                onMouseEnter={handleLegendMouseEnter}
                onMouseLeave={handleLegendMouseLeave}
              />

              {/* Draw one line per model in chartData.  
                  isAnimationActive={false} disables the "draw in" animation. */}
              {Object.keys(chartData[0])
                .filter((k) => k !== "date")
                .map((modelKey, idx) => (
                  <Line
                    key={modelKey}
                    type="linear" // no smoothing
                    dataKey={modelKey}
                    stroke={chakraColors[idx % chakraColors.length]}
                    strokeWidth={2}
                    dot={true} // show dots at each data point
                    isAnimationActive={false} // no entry animation
                    strokeOpacity={
                      hoveredLine && hoveredLine !== modelKey ? 0.3 : 1
                    }
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
}

/**
 * Gather daily runs for the last 10 days into array { date, ModelName: runs, ... }
 */
function buildChartDataLastTenDays(models, allStats) {
  const cutoff = daysAgo(10);
  const dateMap = {};

  for (const model of models) {
    const slug = `${model.owner}/${model.name}`;
    const dailyStats = allStats[slug];
    if (!dailyStats) continue;

    for (const record of dailyStats) {
      const d = new Date(record.date);
      if (d < cutoff) continue;

      if (!dateMap[record.date]) {
        dateMap[record.date] = { date: record.date };
      }
      dateMap[record.date][model.name] = record.dailyRuns;
    }
  }

  return Object.values(dateMap).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
}
