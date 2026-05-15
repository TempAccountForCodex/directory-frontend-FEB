/**
 * WebsiteBlogDashboard
 *
 * Thin wrapper component for the Website Blog management route.
 * Step 2.24A.3 — Route Registration + Wrapper
 *
 * Extracts websiteId and subtab from useParams(),
 * gets user from useAuth(), and renders WebsiteManageInsights.
 */

import React from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import WebsiteManageInsights from "./WebsiteManageInsights";

const WebsiteBlogDashboard: React.FC = () => {
  const { websiteId, subtab } = useParams<{
    websiteId: string;
    subtab?: string;
  }>();
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <WebsiteManageInsights user={user} websiteId={websiteId} subtab={subtab} />
  );
};

export default WebsiteBlogDashboard;
