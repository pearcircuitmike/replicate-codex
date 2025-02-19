// pages/dashboard/highlights.js

import React from "react";
import DashboardLayout from "@/components/Dashboard/Layout/DashboardLayout";
import UserHighlights from "@/components/Dashboard/Views/UserHighlights";

const HighlightsPage = () => {
  return (
    <DashboardLayout>
      <UserHighlights />
    </DashboardLayout>
  );
};

export default HighlightsPage;
