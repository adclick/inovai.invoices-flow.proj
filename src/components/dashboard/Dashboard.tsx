
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
      // Get new jobs count
      const { data: draftJobs, error: draftJobsError } = await supabase
        .from("jobs")
        .select("id", { count: "exact" })
        .eq("status", "draft")

      if (draftJobsError) throw draftJobsError;

      // Get active jobs count
      const { data: activeJobs, error: activeJobsError } = await supabase
        .from("jobs")
        .select("id", { count: "exact" })
        .eq("status", "active")

      if (activeJobsError) throw activeJobsError;

      // Get pending invoice jobs count
      const { count: pendingInvoiceCount, error: pendingInvoiceError } = await supabase
        .from("jobs")
        .select("*", { count: "exact" })
        .eq("status", "pending_invoice");

      if (pendingInvoiceError) throw pendingInvoiceError;

      // Get pending validation jobs count
      const { count: pendingValidationCount, error: pendingValidationError } = await supabase
        .from("jobs")
        .select("*", { count: "exact" })
        .eq("status", "pending_validation");

      if (pendingValidationError) throw pendingValidationError;

      // Get approved jobs count (Pending Payment)
      const { count: pendingPaymentCount, error: pendingPaymentError } = await supabase
        .from("jobs")
        .select("*", { count: "exact" })
        .eq("status", "pending_payment");

      if (pendingPaymentError) throw pendingPaymentError;

      // Get paid jobs count
      const { count: paidCount, error: paidError } = await supabase
        .from("jobs")
        .select("*", { count: "exact" })
        .eq("status", "paid");

      if (paidError) throw paidError;

      return {
        new: draftJobs?.length || 0,
        active: activeJobs?.length || 0,
        pendingInvoice: pendingInvoiceCount || 0,
        pendingValidation: pendingValidationCount || 0,
        pendingPayment: pendingPaymentCount || 0,
        paid: paidCount || 0
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
          campaign:campaign_id(name),
          client:campaign_id(client:client_id(name)),
          provider:provider_id(name),
          manager:manager_id(name)
        `)
        .order("created_at", { ascending: false })
        .limit(8);

      if (error) throw error;
      return data;
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
        .eq("active", true)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  // Prepare chart data
  const chartData = [
    { name: t('dashboard.draft'), value: stats?.new || 0 },
    { name: t('dashboard.active'), value: stats?.active || 0 },
    { name: t('dashboard.pendingInvoice'), value: stats?.pendingInvoice || 0 },
    { name: t('dashboard.pendingValidation'), value: stats?.pendingValidation || 0 },
    { name: t('dashboard.pendingPayment'), value: stats?.pendingPayment || 0 },
    { name: t('dashboard.paid'), value: stats?.paid || 0 }
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

  const totalJobs = chartData.reduce((sum, item) => sum + item.value, 0);
  const pendingActionJobs = stats ? stats.pendingInvoice + stats.pendingValidation + stats.pendingPayment : 0;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Dashboard Header */}
        <DashboardHeader title={t('navigation.dashboard')} />

        {/* Overview Cards */}
        <StatsCards 
          totalJobs={totalJobs}
          pendingActionJobs={pendingActionJobs}
          completedJobs={stats?.paid || 0}
          isLoading={isStatsLoading}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Charts Section */}
          <JobsChart chartData={chartData} isLoading={isStatsLoading} />
          <StatusBreakdown stats={stats} />
        </div>

        {/* Recent Activity and Campaigns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <RecentActivity recentActivity={recentActivity} isLoading={isActivityLoading} />
          <ActiveCampaigns campaigns={activeCampaigns} isLoading={isCampaignsLoading} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
