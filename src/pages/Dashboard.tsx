
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCards from "@/components/dashboard/StatsCards";
import JobsChart from "@/components/dashboard/JobsChart";
import StatusBreakdown from "@/components/dashboard/StatusBreakdown";
import RecentActivity from "@/components/dashboard/RecentActivity";
import ActiveCampaigns from "@/components/dashboard/ActiveCampaigns";

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();

  // Query to fetch job statistics
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      // Get active jobs count
      const { count: activeCount, error: activeJobsError } = await supabase
        .from("jobs")
        .select("*", { count: "exact" })
        .eq("status", "active" as any);

      if (activeJobsError) throw activeJobsError;

      // Get closed jobs count
      const { count: closedCount, error: closedJobsError } = await supabase
        .from("jobs")
        .select("*", { count: "exact" })
        .eq("status", "closed" as any);

      if (closedJobsError) throw closedJobsError;

      return {
        active: activeCount || 0,
        closed: closedCount || 0,
        working: activeCount || 0,
      };
    },
    // Don't refetch on window focus to reduce API calls
    refetchOnWindowFocus: false,
  });

  // Query to fetch recent activity
  const { data: recentActivity, isLoading: isActivityLoading } = useQuery({
    queryKey: ["recent-activity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          id,
          status,
          created_at,
          campaign:campaign_id(name, client:client_id(name)),
          provider:provider_id(name),
          manager:manager_id(name)
        `)
        .order("created_at", { ascending: false })
        .limit(8);

      if (error) throw error;
      
      return data?.map(item => ({
        ...item as any,
        campaign: (item as any).campaign?.[0] || null,
        provider: (item as any).provider?.[0] || null,
        manager: (item as any).manager?.[0] || null,
      })) || [];
    },
  });

  // Query to fetch active campaigns
  const { data: activeCampaigns, isLoading: isCampaignsLoading } = useQuery({
    queryKey: ["active-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select(`
          id,
          name,
          client:client_id(name),
          jobs:jobs!inner(
            id,
            status
          )
        `)
        .eq("active", true as any)
        .order("name");

      if (error) throw error;
      return data as any;
    },
  });

  // Prepare chart data
  const chartData = [
    { name: t('dashboard.active'), value: stats?.active || 0 },
    { name: t('dashboard.closed'), value: stats?.closed || 0 }
  ];

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const pendingActionJobs = 0;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Dashboard Header */}
        <DashboardHeader title={t('navigation.dashboard')} />

        {/* Overview Cards */}
        <StatsCards 
          workingJobs={stats?.working || 0}
          pendingActionJobs={pendingActionJobs}
          completedJobs={stats?.closed || 0}
          isLoading={isStatsLoading}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Charts Section */}
          <JobsChart chartData={chartData} isLoading={isStatsLoading} />
          <StatusBreakdown stats={stats} />
        </div>

        {/* Recent Activity and Campaigns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <RecentActivity recentActivity={recentActivity || []} isLoading={isActivityLoading} />
          <ActiveCampaigns campaigns={activeCampaigns} isLoading={isCampaignsLoading} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
