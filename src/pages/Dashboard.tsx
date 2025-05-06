
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { 
	Clock, CheckCircle, XCircle, AlertCircle, Users, FileText, 
	Search, Filter, Megaphone, BarChart3, TrendingUp, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatJobStatus } from "@/types/job";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
	ChartContainer, 
	ChartTooltip,
	ChartTooltipContent
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

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
				<div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
					<div>
						<h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{t('navigation.dashboard')}</h1>
						<p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
					</div>
					<div className="flex items-center space-x-2">
						<Button variant="outline" size="sm" className="hidden md:flex">
							<Filter className="mr-1 h-4 w-4" />
							{t('common.filter')}
						</Button>
						<Button variant="outline" size="sm" className="hidden md:flex">
							<Search className="mr-1 h-4 w-4" />
							{t('common.search')}
						</Button>
						<Button size="sm">
							<Plus className="mr-1 h-4 w-4" />
							{t('jobs.newJob')}
						</Button>
					</div>
				</div>

				{/* Overview Cards */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('dashboard.totalJobs')}</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex items-baseline justify-between">
								<div className="text-3xl font-bold">
									{isStatsLoading ? <Skeleton className="h-9 w-16" /> : totalJobs}
								</div>
								<div className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs px-2 py-0.5 rounded-full font-medium flex items-center">
									<TrendingUp className="h-3 w-3 mr-1" />
									12%
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('dashboard.pendingActions')}</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex items-baseline justify-between">
								<div className="text-3xl font-bold">
									{isStatsLoading ? <Skeleton className="h-9 w-16" /> : pendingActionJobs}
								</div>
								<Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
									{t('dashboard.needsAttention')}
								</Badge>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('dashboard.completedJobs')}</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex items-baseline justify-between">
								<div className="text-3xl font-bold">
									{isStatsLoading ? <Skeleton className="h-9 w-16" /> : stats?.paid || 0}
								</div>
								<div className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs px-2 py-0.5 rounded-full font-medium flex items-center">
									<CheckCircle className="h-3 w-3 mr-1" />
									{t('dashboard.paid')}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
					{/* Charts Section */}
					<Card className="lg:col-span-8">
						<CardHeader>
							<CardTitle>{t('dashboard.jobsOverview')}</CardTitle>
							<CardDescription>{t('dashboard.currentStatusDistribution')}</CardDescription>
						</CardHeader>
						<CardContent>
							{isStatsLoading ? (
								<div className="w-full aspect-[3/2]">
									<Skeleton className="w-full h-full" />
								</div>
							) : (
								<div className="h-80">
									<ChartContainer config={{}} className="w-full h-full">
										<BarChart data={chartData}>
											<XAxis dataKey="name" />
											<YAxis />
											<Tooltip content={<ChartTooltipContent />} />
											<Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
										</BarChart>
									</ChartContainer>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Job Status Breakdown */}
					<Card className="lg:col-span-4">
						<CardHeader>
							<CardTitle>{t('dashboard.statusBreakdown')}</CardTitle>
							<CardDescription>{t('dashboard.jobsByStatus')}</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center">
										<div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
										<span className="text-sm font-medium">{t('dashboard.draft')}</span>
									</div>
									<span className="font-medium">{stats?.new || 0}</span>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center">
										<div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
										<span className="text-sm font-medium">{t('dashboard.active')}</span>
									</div>
									<span className="font-medium">{stats?.active || 0}</span>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center">
										<div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
										<span className="text-sm font-medium">{t('dashboard.pendingInvoice')}</span>
									</div>
									<span className="font-medium">{stats?.pendingInvoice || 0}</span>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center">
										<div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
										<span className="text-sm font-medium">{t('dashboard.pendingValidation')}</span>
									</div>
									<span className="font-medium">{stats?.pendingValidation || 0}</span>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center">
										<div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
										<span className="text-sm font-medium">{t('dashboard.pendingPayment')}</span>
									</div>
									<span className="font-medium">{stats?.pendingPayment || 0}</span>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center">
										<div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
										<span className="text-sm font-medium">{t('dashboard.paid')}</span>
									</div>
									<span className="font-medium">{stats?.paid || 0}</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Recent Activity and Campaigns */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
					{/* Recent Activity Section */}
					<Card className="lg:col-span-8">
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between">
								<CardTitle>{t('dashboard.recentActivity')}</CardTitle>
								<Button variant="ghost" size="sm" className="text-sm">
									{t('common.viewAll')}
								</Button>
							</div>
							<Tabs defaultValue="all" className="mt-2">
								<TabsList className="grid w-full grid-cols-3 h-9">
									<TabsTrigger value="all">{t('common.all')}</TabsTrigger>
									<TabsTrigger value="pending">{t('dashboard.pending')}</TabsTrigger>
									<TabsTrigger value="completed">{t('dashboard.completed')}</TabsTrigger>
								</TabsList>
							</Tabs>
						</CardHeader>
						<CardContent>
							{isActivityLoading ? (
								<div className="space-y-4">
									{Array.from({ length: 5 }).map((_, i) => (
										<div key={i} className="flex items-center space-x-4">
											<Skeleton className="h-12 w-12 rounded-full" />
											<div className="space-y-2">
												<Skeleton className="h-4 w-[250px]" />
												<Skeleton className="h-4 w-[200px]" />
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="space-y-4">
									{recentActivity?.map((activity) => (
										<div key={activity.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
											<div className="flex items-center space-x-3">
												<Badge
													variant={
														activity.status === "paid" ? "default" : 
														activity.status.startsWith("pending") ? "secondary" : 
														"outline"
													}
												>
													{formatJobStatus(activity.status)}
												</Badge>
												<div>
													<p className="text-sm font-medium text-slate-800 dark:text-slate-200">
														{activity.campaign?.name} - {activity.client?.name}
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
							)}
						</CardContent>
					</Card>

					{/* Active Campaigns Section */}
					<Card className="lg:col-span-4">
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between">
								<CardTitle>{t('dashboard.activeCampaigns')}</CardTitle>
								<Button variant="ghost" size="sm" className="text-sm">
									{t('common.viewAll')}
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							{isCampaignsLoading ? (
								<div className="space-y-4">
									{Array.from({ length: 3 }).map((_, i) => (
										<div key={i} className="space-y-2">
											<Skeleton className="h-5 w-full" />
											<Skeleton className="h-4 w-2/3" />
											<Skeleton className="h-4 w-1/3" />
										</div>
									))}
								</div>
							) : (
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
											<div key={campaign.id} className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
												<div className="flex items-center justify-between mb-2">
													<h3 className="text-sm font-medium text-slate-800 dark:text-slate-200">
														{campaign.name}
													</h3>
													<Badge variant={hasPendingJobs ? "secondary" : hasActiveJobs ? "default" : "outline"}>
														{hasPendingJobs ? t('dashboard.pending') : hasActiveJobs ? t('dashboard.active') : t('dashboard.completed')}
													</Badge>
												</div>
												<p className="text-xs text-slate-500 dark:text-slate-400">
													{campaign.client?.name}
												</p>
												<div className="mt-2 flex items-center space-x-2">
													<span className="text-xs text-slate-500 dark:text-slate-400">
														{campaign.jobs.length} {t('dashboard.jobs')}
													</span>
													<div className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
														<div 
															className="h-full bg-primary rounded-full"
															style={{ 
																width: `${(campaign.jobs.filter(job => job.status === 'paid').length / campaign.jobs.length) * 100}%` 
															}}
														></div>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</DashboardLayout>
	);
};

export default Dashboard;
