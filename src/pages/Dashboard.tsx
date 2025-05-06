import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Clock, CheckCircle, XCircle, AlertCircle, Users, FileText, Search, Filter, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatJobStatus } from "@/types/job";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const Dashboard: React.FC = () => {
	const { t } = useTranslation();
	const { user, isLoading } = useAuth();

	// Query to fetch job statistics
	const { data: stats } = useQuery({
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

			if (activeJobsError) throw draftJobsError;

			// Get pending invoice jobs count
			const { count: pendingInvoiceCount, error: pendingInvoiceError } = await supabase
				.from("jobs")
				.select("*", { count: "exact" })
				.eq("status", "pending_invoice");

			if (pendingInvoiceError) throw pendingInvoiceError;

			// Get pending invoice jobs count
			const { count: pendingValidationCount, error: pendingValidationError } = await supabase
				.from("jobs")
				.select("*", { count: "exact" })
				.eq("status", "pending_validation");

			if (pendingValidationError) throw pendingValidationError;

			// Get approved jobs count (Paid)
			const { count: pendingPaymentCount, error: pendingPaymentError } = await supabase
				.from("jobs")
				.select("*", { count: "exact" })
				.eq("status", "pending_payment");

			if (pendingPaymentError) throw pendingPaymentError;

			// Get rejected jobs count (Pending Payment)
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
	const { data: recentActivity } = useQuery({
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
				.limit(5);

			if (error) throw error;
			return data;
		},
	});

	// Query to fetch active campaigns
	const { data: activeCampaigns } = useQuery({
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

	return (
		<DashboardLayout>
			<div className="p-4 sm:p-6 space-y-6 md:space-y-8">
				{/* Stats Grid - Made responsive */}
				<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-6 gap-4 md:gap-6">
					<div className="bg-gradient-to-br from-blue-50 to-white dark:from-slate-800/95 dark:to-slate-800/50 p-4 md:p-6 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all backdrop-blur-sm">
						<div className="space-y-2">
							<div className="flex items-center space-x-2">
								<div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
									<Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
								</div>
								<span className="text-sm text-slate-600 dark:text-slate-300">{t("dashboard.inProgress")}</span>
							</div>
							<h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{t("dashboard.draftJobs")}</h2>
							<p className="text-2xl font-bold text-primary dark:text-primary/90">{stats?.new || 0}</p>
						</div>
					</div>
					<div className="bg-gradient-to-br from-blue-50 to-white dark:from-slate-800/95 dark:to-slate-800/50 p-4 md:p-6 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all backdrop-blur-sm">
						<div className="space-y-2">
							<div className="flex items-center space-x-2">
								<div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
									<Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
								</div>
								<span className="text-sm text-slate-600 dark:text-slate-300">{t("dashboard.inProgress")}</span>
							</div>
							<h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{t("dashboard.activeJobs")}</h2>
							<p className="text-2xl font-bold text-primary dark:text-primary/90">{stats?.active || 0}</p>
						</div>
					</div>
					<div className="bg-gradient-to-br from-orange-50 to-white dark:from-slate-800/95 dark:to-slate-800/50 p-4 md:p-6 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all backdrop-blur-sm">
						<div className="space-y-2">
							<div className="flex items-center space-x-2">
								<div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
									<AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
								</div>
								<span className="text-sm text-slate-600 dark:text-slate-300">{t("dashboard.awaitingAction")}</span>
							</div>
							<h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{t("dashboard.pendingInvoice")}</h2>
							<p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats?.pendingInvoice || 0}</p>
						</div>
					</div>
					<div className="bg-gradient-to-br from-orange-50 to-white dark:from-slate-800/95 dark:to-slate-800/50 p-4 md:p-6 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all backdrop-blur-sm">
						<div className="space-y-2">
							<div className="flex items-center space-x-2">
								<div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
									<AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
								</div>
								<span className="text-sm text-slate-600 dark:text-slate-300">{t("dashboard.awaitingAction")}</span>
							</div>
							<h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{t("dashboard.pendingValidation")}</h2>
							<p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats?.pendingValidation || 0}</p>
						</div>
					</div>
					<div className="bg-gradient-to-br from-orange-50 to-white dark:from-slate-800/95 dark:to-slate-800/50 p-4 md:p-6 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all backdrop-blur-sm">
						<div className="space-y-2">
							<div className="flex items-center space-x-2">
								<div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
									<AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
								</div>
								<span className="text-sm text-slate-600 dark:text-slate-300">{t("dashboard.awaitingAction")}</span>
							</div>
							<h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{t("dashboard.pendingPayment")}</h2>
							<p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats?.pendingPayment || 0}</p>
						</div>
					</div>
					<div className="bg-gradient-to-br from-green-50 to-white dark:from-slate-800/95 dark:to-slate-800/50 p-4 md:p-6 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all backdrop-blur-sm">
						<div className="space-y-2">
							<div className="flex items-center space-x-2">
								<div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
									<CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
								</div>
								<span className="text-sm text-slate-600 dark:text-slate-300">{t("dashboard.processedSuccessfully")}</span>
							</div>
							<h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{t("dashboard.paid")}</h2>
							<p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats?.paid || 0}</p>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
					{/* Recent Activity Section - Made responsive */}
					<div className="lg:col-span-2 bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-200/50 dark:border-slate-700 shadow-sm">
						<div className="p-4 md:p-6">
							<div className="flex items-center space-x-3 mb-4">
								<div className="p-2 bg-primary/10 rounded-lg">
									<Clock className="w-5 h-5 text-primary" />
								</div>
								<div>
									<h2 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100">{t("dashboard.recentActivity")}</h2>
									<p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">{t("dashboard.latestInvoiceSubmissions")}</p>
								</div>
							</div>
							<div className="space-y-4">
								{recentActivity?.map((activity) => (
									<div key={activity.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
										<div className="flex items-center space-x-3">
											<Badge variant={activity.status === "paid" ? "default" : "secondary"}>
												{formatJobStatus(activity.status)}
											</Badge>
											<div>
												<p className="text-sm font-medium text-slate-800 dark:text-slate-200">
													{activity.campaign?.name} - {activity.client?.client?.name}
												</p>
												<p className="text-xs text-slate-500 dark:text-slate-400">
													{activity.provider?.name} • {format(new Date(activity.created_at), "MMM d, yyyy")}
												</p>
											</div>
										</div>
										<div className="text-right">
											<p className="text-sm text-slate-600 dark:text-slate-400">{activity.manager?.name}</p>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Active Campaigns Section - Made responsive */}
					<div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-200/50 dark:border-slate-700 shadow-sm">
						<div className="p-4 md:p-6">
							<div className="flex items-center space-x-3 mb-4">
								<div className="p-2 bg-primary/10 rounded-lg">
									<Megaphone className="w-5 h-5 text-primary" />
								</div>
								<div>
									<h2 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100">{t("dashboard.activeCampaigns")}</h2>
									<p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">{t("dashboard.campaignsOnGoing")}</p>
								</div>
							</div>
							<div className="space-y-4">
								{activeCampaigns?.map((campaign) => {
									const jobStatuses = campaign.jobs.map(job => job.status);
									const hasPendingJobs = jobStatuses.some(status => 
										["pending_invoice", "pending_validation", "pending_payment"].includes(status)
									);
									const hasActiveJobs = jobStatuses.some(status => 
										["draft", "active"].includes(status)
									);

									return (
										<div key={campaign.id} className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
											<div className="flex items-center justify-between mb-2">
												<h3 className="text-sm font-medium text-slate-800 dark:text-slate-200">
													{campaign.name}
												</h3>
												<Badge variant={hasPendingJobs ? "secondary" : hasActiveJobs ? "default" : "outline"}>
													{hasPendingJobs ? t("dashboard.pending") : hasActiveJobs ? t("dashboard.active") : t("dashboard.completed")}
												</Badge>
											</div>
											<p className="text-xs text-slate-500 dark:text-slate-400">
												{campaign.client?.name}
											</p>
											<div className="mt-2 flex items-center space-x-2">
												<span className="text-xs text-slate-500 dark:text-slate-400">
													{campaign.jobs.length} {t("dashboard.jobs")}
												</span>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
};

export default Dashboard;
