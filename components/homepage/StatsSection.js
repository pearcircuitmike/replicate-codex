import React, { useState, useEffect } from "react";
import { Box, Container, Heading, Text, SimpleGrid } from "@chakra-ui/react";
import { ParentSize } from "@visx/responsive";
import { scaleLinear } from "@visx/scale";
import { Area } from "@visx/shape";
import { curveBasis } from "@visx/curve";
import { LinearGradient } from "@visx/gradient";

function x(d) {
  return d.index;
}
function y(d) {
  return Math.max(d.value, 0.25);
}

function interpolatePoints(current, next) {
  if (!next) return current;
  const xStep = 0.25;
  const yStep = Math.abs(y(next) - y(current)) * 0.03;
  const yMid1 = Math.abs(y(current) - yStep);
  const yMid2 = Math.abs(y(next) + yStep);
  const xMid1 = Math.abs(x(current) + xStep);
  const xMid2 = Math.abs(x(next) - xStep);
  return [
    current,
    { index: xMid1, value: yMid1 },
    { index: xMid2, value: yMid2 },
  ];
}

function interpolateData(data) {
  return data.map((d, i) => interpolatePoints(d, data[i + 1])).flat();
}

function FunnelChart({ width, height, segments }) {
  const data = interpolateData(segments);
  const numSegments = Math.max(...segments.map(x));
  const maxValue = Math.max(...data.map(y));
  const valuePadding = 50;
  const minmax = maxValue + valuePadding;

  const xScale = scaleLinear({ range: [0, width], domain: [0, numSegments] });
  const yScale = scaleLinear({ range: [height, 0], domain: [-minmax, minmax] });

  const areas = [
    { pad: 0, opacity: 1 },
    { pad: 15, opacity: 0.2 },
    { pad: 30, opacity: 0.1 },
  ];

  return (
    <svg width={width} height={height}>
      <LinearGradient
        id="gradient"
        from="#4299E1"
        to="#48BB78"
        vertical={false}
      />
      <rect width={width} height={height} fill="#EBF8FF" rx={22} />
      {areas.map((area, i) => (
        <Area
          key={i}
          data={data}
          curve={curveBasis}
          x={(d) => xScale(x(d))}
          y0={(d) => yScale(y(d) + area.pad)}
          y1={(d) => yScale(-y(d) - area.pad)}
          fill="url(#gradient)"
          fillOpacity={area.opacity}
          stroke="transparent"
        />
      ))}
      {/* No percentages, no vertical lines rendered here */}
    </svg>
  );
}

export default function StatsSection() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const stepsInfo = [
    {
      index: 0,
      title: "Discover AI breakthroughs",
      text: "Our listening algorithm identifies the AI developments with the biggest impact.",
      statKey: "weeklyPapersCount",
      label: "Papers and models released this week",
    },
    {
      index: 1,
      title: "Skim summaries of each discovery",
      text: "We translate models and papers into short, clear guides.",
      statKey: "weeklySummariesCount",
      label: "Summaries created this week",
    },
    {
      index: 2,
      title: "Meet helpful experts and friends",
      text: "Join the Discord to chat with the creators and builders behind the breakthroughs.",
      statKey: "weeklySignups",
      label: "New ML researchers this week",
    },
    {
      index: 3,
      title: "Subscribe now for personalized insights",
      text: "Get exclusive access to our AI community and more!",
      statKey: "uniquePapersCount",
      label: "Unique papers across top tasks",
    },
  ];

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/stats/get-overall-stats");
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Failed to load stats");
      }
    }
    fetchStats();
  }, []);

  if (error) {
    return (
      <Box bg="blue.50" py={16} width="100%">
        <Container maxW="7xl">
          <Heading as="h2" fontSize="4xl" mb={8} textAlign="center">
            How it works
          </Heading>
          <Text textAlign="center" color="red.500">
            {error}
          </Text>
        </Container>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box bg="blue.50" py={16} width="100%">
        <Container maxW="7xl">
          <Heading as="h2" fontSize="4xl" mb={8} textAlign="center">
            How it works
          </Heading>
          <Text textAlign="center">Loading funnel data...</Text>
        </Container>
      </Box>
    );
  }

  const {
    weeklyPapersCount = 0,
    weeklySummariesCount = 0,
    weeklySignups = 0,
    uniquePapersCount = 0,
  } = stats;

  // Log normalization as before
  const originalValues = [
    weeklyPapersCount,
    weeklySummariesCount,
    weeklySignups,
    uniquePapersCount,
    0,
  ];
  const topVal = Math.max(...originalValues.slice(0, 4), 1);
  const logTop = Math.log10(topVal);
  const segments = originalValues.map((val, i) => {
    const logVal = val > 0 ? Math.log10(val) : 0;
    const normalized = (logVal / logTop) * 100;
    return {
      index: i,
      value: i === originalValues.length - 1 ? 0 : normalized,
    };
  });

  return (
    <Box bg="blue.50" py={16} width="100%">
      <Container maxW="7xl" position="relative">
        <Heading as="h2" fontSize="4xl" mb={8} textAlign="center">
          How it works
        </Heading>

        <Box position="relative" width="100%" height="400px">
          {/* Funnel behind (zIndex 1) */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            zIndex={1}
          >
            <ParentSize>
              {(parent) => (
                <FunnelChart
                  width={parent.width}
                  height={parent.height}
                  segments={segments}
                />
              )}
            </ParentSize>
          </Box>

          {/* Stats overlay (zIndex 2) */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            zIndex={2}
            // No gray box or shared background
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <SimpleGrid columns={4} spacing={0} width="100%" px={[4, 8]}>
              {stepsInfo.map((step, idx) => {
                const stepValue = stats[step.statKey] || 0;
                return (
                  <Box
                    key={idx}
                    bg="white"
                    p={6}
                    borderRadius="md"
                    boxShadow="md"
                    textAlign="center"
                    mx="auto" // center each box in its column
                    width="200px" // fixed width so they don't stretch, adjust as needed
                  >
                    <Heading fontSize="lg" mb={2}>
                      {step.title}
                    </Heading>
                    <Text fontSize="sm" mb={2} color="gray.700">
                      {step.text}
                    </Text>
                    <Heading fontSize="2xl" color="red.500" mb={1}>
                      {stepValue}
                    </Heading>
                    <Text fontSize="xs" color="gray.600">
                      {step.label}
                    </Text>
                  </Box>
                );
              })}
            </SimpleGrid>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
