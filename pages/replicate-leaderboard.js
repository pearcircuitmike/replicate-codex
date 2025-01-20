// pages/replicate-leaderboard.js
import React, { useState } from "react";
import {
  Container,
  Heading,
  Text,
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { orderBy } from "lodash-es";
import MetaTags from "@/components/MetaTags";
import AuthForm from "@/components/AuthForm";
import ChartArea from "@/components/Leaderboard/ChartArea"; // We'll see this below
import LeaderboardTable from "@/components/Leaderboard/LeaderboardTable";
import { buildSlugMap, daysAgo } from "@/components/Leaderboard/dataHelpers";

export async function getStaticProps() {
  let topTen10d = [];
  let topTenRising = [];
  let allTimeTop = [];
  let allStats = {};

  try {
    // 1) Load model data
    const { default: allModels } = await import(
      "all-the-public-replicate-models"
    );
    const statsModule = await import("all-the-public-replicate-models/stats");
    allStats = statsModule.default || {};

    // 2) Last 10 Days: sum dailyRuns from last 10 days
    const slugMap10d = buildSlugMap(allModels, "run_count_10d");
    const cutoff10 = daysAgo(10);

    for (const [slug, dailyStats] of Object.entries(allStats)) {
      const mappedModel = slugMap10d.get(slug);
      if (!mappedModel) continue;

      let sum10 = 0;
      for (const record of dailyStats) {
        if (new Date(record.date) >= cutoff10) {
          sum10 += record.dailyRuns;
        }
      }
      mappedModel.run_count_10d = sum10;
    }

    const arr10d = Array.from(slugMap10d.values());
    topTen10d = orderBy(arr10d, ["run_count_10d"], ["desc"]).slice(0, 10);

    // 3) Rising Stars: difference between last 10 and previous 10 days
    const slugMapRising = buildSlugMap(allModels, [
      "run_count_10d_recent",
      "run_count_10d_prior",
    ]);
    const cutoffPriorStart = daysAgo(20);
    const cutoffPriorEnd = daysAgo(10);

    for (const [slug, dailyStats] of Object.entries(allStats)) {
      const mappedModel = slugMapRising.get(slug);
      if (!mappedModel) continue;

      let recentSum = 0;
      let priorSum = 0;
      for (const record of dailyStats) {
        const d = new Date(record.date);
        if (d >= cutoff10) {
          recentSum += record.dailyRuns;
        } else if (d >= cutoffPriorStart && d < cutoffPriorEnd) {
          priorSum += record.dailyRuns;
        }
      }
      mappedModel.run_count_10d_recent = recentSum;
      mappedModel.run_count_10d_prior = priorSum;
    }

    const risingArr = Array.from(slugMapRising.values()).map((m) => {
      const growth = m.run_count_10d_recent - m.run_count_10d_prior;
      return { ...m, run_count_growth: growth };
    });
    topTenRising = orderBy(risingArr, ["run_count_growth"], ["desc"]).slice(
      0,
      10
    );

    // 4) All-Time: by run_count
    allTimeTop = orderBy(allModels, ["run_count"], ["desc"]).slice(0, 10);
  } catch (err) {
    console.error("Error in getStaticProps for replicate-leaderboard:", err);
  }

  return {
    props: { topTen10d, topTenRising, allTimeTop, allStats },
    revalidate: 86400,
  };
}

export default function ReplicateLeaderboard({
  topTen10d = [],
  topTenRising = [],
  allTimeTop = [],
  allStats = {},
}) {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <>
      <MetaTags
        title="AIModels.fyi - Replicate Leaderboards"
        description="Compare popular Replicate models: last 10 days, rising stars, all-time."
      />

      <Container maxW="4xl" py={8}>
        <Heading size="lg" mb={2}>
          Replicate Leaderboards
        </Heading>
        <Text mb={4}>
          Compare the most popular Replicate models in multiple ways. Choose a
          tab below to see the top models from the last 10 days, the rising
          stars, or the all-time favorites. Click on a model to learn more about
          it.
        </Text>

        {/* CHART of last 10 days. We'll show daily runs for whichever tab's top 10. */}
        <ChartArea
          tabIndex={tabIndex}
          topTen10d={topTen10d}
          topTenRising={topTenRising}
          allTimeTop={allTimeTop}
          allStats={allStats}
        />

        {/* TABS */}
        <Tabs
          index={tabIndex}
          onChange={(idx) => setTabIndex(idx)}
          variant="enclosed"
          colorScheme="blue"
        >
          <TabList mb="1em">
            <Tab>Last 10 Days 🕙</Tab>
            <Tab>Rising Stars ✨</Tab>
            <Tab>All-Time 🏅</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <LeaderboardTable
                heading="Top Models - Last 10 Days"
                models={topTen10d}
                runsField="run_count_10d"
              />
            </TabPanel>

            <TabPanel>
              <LeaderboardTable
                heading="Rising Stars (Biggest Increase Week-over-Week)"
                models={topTenRising}
                runsField="run_count_growth"
              />
            </TabPanel>

            <TabPanel>
              <LeaderboardTable
                heading="All-Time Top Models"
                models={allTimeTop}
                runsField="run_count"
              />
            </TabPanel>
          </TabPanels>
        </Tabs>

        <Box align="center" mt={5}>
          <Heading size="md" my={2}>
            Want to get updates when new models top the charts?
          </Heading>
          <Text mb={4}>
            Sign up below to stay informed about emerging models on Replicate.
          </Text>
          <AuthForm isUpgradeFlow />
        </Box>
      </Container>
    </>
  );
}
