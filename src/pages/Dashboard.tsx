import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Clock, CheckCircle, XCircle, AlertCircle, Users, FileText, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatJobStatus } from "@/types/job";

const Dashboard: React.FC = () => {
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
								<span className="text-sm text-slate-600 dark:text-slate-300">In Progress</span>
							</div>
							<h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Drafts Jobs</h2>
							<p className="text-2xl font-bold text-primary dark:text-primary/90">{stats?.new || 0}</p>
						</div>
					</div>
					<div className="bg-gradient-to-br from-blue-50 to-white dark:from-slate-800/95 dark:to-slate-800/50 p-4 md:p-6 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all backdrop-blur-sm">
						<div className="space-y-2">
							<div className="flex items-center space-x-2">
								<div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
									<Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
								</div>
								<span className="text-sm text-slate-600 dark:text-slate-300">In Progress</span>
							</div>
							<h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Active Jobs</h2>
							<p className="text-2xl font-bold text-primary dark:text-primary/90">{stats?.active || 0}</p>
						</div>
					</div>
					<div className="bg-gradient-to-br from-orange-50 to-white dark:from-slate-800/95 dark:to-slate-800/50 p-4 md:p-6 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all backdrop-blur-sm">
						<div className="space-y-2">
							<div className="flex items-center space-x-2">
								<div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
									<AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
								</div>
								<span className="text-sm text-slate-600 dark:text-slate-300">Awaiting action</span>
							</div>
							<h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Pending Invoice</h2>
							<p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats?.pendingInvoice || 0}</p>
						</div>
					</div>
					<div className="bg-gradient-to-br from-orange-50 to-white dark:from-slate-800/95 dark:to-slate-800/50 p-4 md:p-6 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all backdrop-blur-sm">
						<div className="space-y-2">
							<div className="flex items-center space-x-2">
								<div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
									<AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
								</div>
								<span className="text-sm text-slate-600 dark:text-slate-300">Awaiting action</span>
							</div>
							<h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Pending Validation</h2>
							<p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats?.pendingValidation || 0}</p>
						</div>
					</div>
					<div className="bg-gradient-to-br from-orange-50 to-white dark:from-slate-800/95 dark:to-slate-800/50 p-4 md:p-6 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all backdrop-blur-sm">
						<div className="space-y-2">
							<div className="flex items-center space-x-2">
								<div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
									<AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
								</div>
								<span className="text-sm text-slate-600 dark:text-slate-300">Awaiting action</span>
							</div>
							<h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Pending Payment</h2>
							<p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats?.pendingPayment || 0}</p>
						</div>
					</div>
					<div className="bg-gradient-to-br from-green-50 to-white dark:from-slate-800/95 dark:to-slate-800/50 p-4 md:p-6 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all backdrop-blur-sm">
						<div className="space-y-2">
							<div className="flex items-center space-x-2">
								<div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
									<CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
								</div>
								<span className="text-sm text-slate-600 dark:text-slate-300">Processed successfully</span>
							</div>
							<h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Paid</h2>
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
									<h2 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100">Recent Activity</h2>
									<p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">Latest invoice submissions</p>
								</div>
							</div>
							<div className="mt-6 text-center text-slate-600 dark:text-slate-400 py-8">
								<p>No recent activity to display</p>
							</div>
						</div>
					</div>

					{/* Active Freelancers Section - Made responsive */}
					<div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-200/50 dark:border-slate-700 shadow-sm">
						<div className="p-4 md:p-6">
							<div className="flex items-center space-x-3 mb-4">
								<div className="p-2 bg-primary/10 rounded-lg">
									<Users className="w-5 h-5 text-primary" />
								</div>
								<div>
									<h2 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100">Active Providers</h2>
									<p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">Providers with pending invoices</p>
								</div>
							</div>
							<div className="mt-6 text-center text-slate-600 dark:text-slate-400 py-8">
								<p>Not yet implemented</p>
							</div>
						</div>
					</div>
				</div>

				{/* Invoice Management Section - Made responsive */}
				<div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-200/50 dark:border-slate-700 shadow-sm">
					<div className="p-4 md:p-6">
						<div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
							<div className="flex items-center space-x-3">
								<div className="p-2 bg-primary/10 rounded-lg">
									<FileText className="w-5 h-5 text-primary" />
								</div>
								<h2 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100">Jobs Management</h2>
							</div>
							<div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
								<div className="relative">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
									<input
										type="text"
										placeholder="Search invoices..."
										className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-full sm:w-64"
									/>
								</div>
								<Button variant="outline" size="icon" className="rounded-lg border-slate-200 dark:border-slate-700">
									<Filter size={18} className="text-slate-600 dark:text-slate-400" />
								</Button>
							</div>
						</div>
						<div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
							<button className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium whitespace-nowrap">New</button>
							<button className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-sm font-medium whitespace-nowrap transition-colors">Pending Invoice</button>
							<button className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-sm font-medium whitespace-nowrap transition-colors">Pending Payment</button>
							<button className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-sm font-medium whitespace-nowrap transition-colors">Paid</button>
						</div>
						<div className="text-sm text-slate-600 dark:text-slate-400 overflow-x-auto">
							<div className="min-w-[600px]">
								<div className="grid grid-cols-6 gap-4 px-4 py-2 font-medium border-b border-slate-200 dark:border-slate-700">
									<div>Client</div>
									<div>Campaign</div>
									<div>Manager</div>
									<div>Provider</div>
									<div>Value</div>
									<div>Status</div>
								</div>
								<div className="text-center py-8">
									<p>Not yet implemented</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
};

export default Dashboard;
