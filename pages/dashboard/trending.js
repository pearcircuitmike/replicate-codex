// pages/dashboard/trending.js

import React from "react";
import DashboardLayout from "@/components/Dashboard/Layout/DashboardLayout";
import TrendingView from "@/components/Dashboard/Views/TrendingView";

const TrendingPage = () => {
  return (
    <DashboardLayout>
      <TrendingView />
    </DashboardLayout>
  );
};

export default TrendingPage;
