// pages/dashboard/trending.js

import React from "react";
import DashboardLayout from "@/components/Dashboard/Layout/DashboardLayout";
import TrendingView from "@/components/Dashboard/Views/TrendingView";

const TrendingPage = ({ trendingData, hasError }) => {
  return (
    <DashboardLayout>
      <TrendingView trendingData={trendingData} hasError={hasError} />
    </DashboardLayout>
  );
};

export async function getStaticProps() {
  const startDate = new Date();
  startDate.setUTCHours(0, 0, 0, 0);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    const [
      trendingTopics,
      topViewedPapers,
      topSearchQueries,
      papers,
      models,
      creators,
      authors,
    ] = await Promise.all([
      fetch(`${baseUrl}/api/dashboard/trending-topics?limit=12`).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch trending topics");
        return res.json();
      }),
      fetch(`${baseUrl}/api/dashboard/top-viewed-papers?limit=12`).then(
        (res) => {
          if (!res.ok) throw new Error("Failed to fetch top viewed papers");
          return res.json();
        }
      ),
      fetch(`${baseUrl}/api/dashboard/top-search-queries?limit=12`).then(
        (res) => {
          if (!res.ok) throw new Error("Failed to fetch top search queries");
          return res.json();
        }
      ),
      fetch(
        `${baseUrl}/api/trending/papers?platform=arxiv&startDate=${encodeURIComponent(
          startDate.toISOString()
        )}&limit=12`
      ).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch trending papers");
        return res.json();
      }),
      fetch(
        `${baseUrl}/api/trending/models?startDate=${encodeURIComponent(
          startDate.toISOString()
        )}&limit=12`
      ).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch trending models");
        return res.json();
      }),
      fetch(`${baseUrl}/api/trending/creators?limit=12`).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch trending creators");
        return res.json();
      }),
      fetch(`${baseUrl}/api/trending/authors?limit=12`).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch trending authors");
        return res.json();
      }),
    ]);

    console.log("Fetched data:", {
      trendingTopics,
      topViewedPapers,
      topSearchQueries,
      papers,
      models,
      creators,
      authors,
    });

    const trendingData = {
      trendingTopics,
      topViewedPapers,
      topSearchQueries,
      papers,
      models,
      creators,
      authors,
    };

    return {
      props: {
        trendingData,
        hasError: false,
      },
      revalidate: 60 * 5, // Revalidate every 5 minutes
    };
  } catch (error) {
    console.error("Error fetching trending data:", error);
    return {
      props: {
        trendingData: {
          trendingTopics: [],
          topViewedPapers: [],
          topSearchQueries: [],
          papers: [],
          models: [],
          creators: [],
          authors: [],
        },
        hasError: true,
      },
      revalidate: 24 * 3600, // Retry after 1 day
    };
  }
}

export default TrendingPage;
