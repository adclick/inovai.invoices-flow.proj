
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger
} from "@/components/ui/collapsible";
import { Job } from "@/types/job";
import { useTranslation } from "react-i18next";

type GroupedJobs = {
	[clientId: string]: {
		clientName: string;
		campaigns: {
			[campaignId: string]: {
				campaignName: string;
				jobs: Job[];
			};
		};
	};
};

const formatCurrency = (value: number, currency: string) => {
	const symbols: Record<string, string> = {
		euro: "€",
		usd: "$",
		gbp: "£"
	};

	const symbol = symbols[currency.toLowerCase()] || currency;
	return `${symbol}${value.toLocaleString()}`;
};

const JobsGroupedList = () => {
	const { t } = useTranslation();
	const [currentPage, setCurrentPage] = useState(1);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
	const [expandedClients, setExpandedClients] = useState<Record<string, boolean>>({});
	const [expandedCampaigns, setExpandedCampaigns] = useState<Record<string, boolean>>({});
	const itemsPerPage = 10;
	const { toast } = useToast();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	// Query to fetch jobs with related entities
	const { data, isLoading, error } = useQuery({
		queryKey: ["jobs"],
		queryFn: async () => {
			// Fetch all jobs
			const { data: jobs, error: jobsError } = await supabase
				.from("jobs")
				.select("*")
				.order("created_at", { ascending: false });

			if (jobsError) throw jobsError;

			// Fetch campaigns with their client information
			const { data: campaigns } = await supabase
				.from("campaigns")
				.select("id, name, client:client_id(id, name)");

			const { data: providers } = await supabase
				.from("providers")
				.select("id, name");

			const { data: managers } = await supabase
				.from("managers")
				.select("id, name");

			// Create lookup tables for entity names
			const campaignMap = campaigns?.reduce((acc: Record<string, any>, campaign) => {
				acc[campaign.id] = {
					name: campaign.name,
					client_id: campaign.client?.id || null,
					client_name: campaign.client?.name || "Unknown Client"
				};
				return acc;
			}, {}) || {};

			const providerMap = providers?.reduce((acc: Record<string, string>, provider) => {
				acc[provider.id] = provider.name;
				return acc;
			}, {}) || {};

			const managerMap = managers?.reduce((acc: Record<string, string>, manager) => {
				acc[manager.id] = manager.name;
				return acc;
			}, {}) || {};

			// Add entity names to jobs
			return jobs.map((job: any) => ({
				...job,
				campaign_name: campaignMap[job.campaign_id]?.name || "Unknown Campaign",
				client_name: campaignMap[job.campaign_id]?.client_name || "Unknown Client",
				client_id: campaignMap[job.campaign_id]?.client_id || null, // Derive client_id from campaign
				provider_name: providerMap[job.provider_id] || "Unknown Provider",
				manager_name: managerMap[job.manager_id] || "Unknown Manager"
			}));
		},
	});

	// Group jobs by client and then by campaign
	const groupedJobs = useMemo<GroupedJobs>(() => {
		return (data || []).reduce((acc: GroupedJobs, job) => {
			// Get the client_id from the derived property
			const clientId = job.client_id || 'unknown';

			// Initialize client if not exists
			if (!acc[clientId]) {
				acc[clientId] = {
					clientName: job.client_name || "Unknown Client",
					campaigns: {}
				};
				// Initialize expanded state for this client
				if (expandedClients[clientId] === undefined) {
					setExpandedClients(prev => ({ ...prev, [clientId]: false }));
				}
			}

			// Initialize campaign if not exists
			if (!acc[clientId].campaigns[job.campaign_id]) {
				acc[clientId].campaigns[job.campaign_id] = {
					campaignName: job.campaign_name || "Unknown Campaign",
					jobs: []
				};
				// Initialize expanded state for this campaign
				const campaignKey = `${clientId}-${job.campaign_id}`;
				if (expandedCampaigns[campaignKey] === undefined) {
					setExpandedCampaigns(prev => ({ ...prev, [campaignKey]: false }));
				}
			}

			// Add job to campaign
			acc[clientId].campaigns[job.campaign_id].jobs.push(job);
			return acc;
		}, {});
	}, [data, expandedClients, expandedCampaigns]);

	// Delete job mutation
	const deleteJob = useMutation({
		mutationFn: async (id: string) => {
			const { error } = await supabase
				.from("jobs")
				.delete()
				.eq("id", id);

			if (error) throw error;
			return id;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["jobs"] });
			toast({
				title: t("jobs.deleteSuccess"),
				description: t("jobs.jobDeletedDescription"),
			});
			setIsDeleteDialogOpen(false);
			setJobToDelete(null);
		},
		onError: (error) => {
			console.error("Error deleting job:", error);
			toast({
				title: t("common.error"),
				description: t("jobs.deleteError"),
				variant: "destructive",
			});
		},
	});

	// Handle delete confirmation
	const handleDeleteClick = (e: React.MouseEvent, job: Job) => {
		e.stopPropagation();
		setJobToDelete(job);
		setIsDeleteDialogOpen(true);
	};

	const confirmDelete = () => {
		if (jobToDelete) {
			deleteJob.mutate(jobToDelete.id);
		}
	};

	// Toggle client expansion
	const toggleClientExpansion = (clientId: string) => {
		setExpandedClients(prev => ({
			...prev,
			[clientId]: !prev[clientId]
		}));
	};

	// Toggle campaign expansion
	const toggleCampaignExpansion = (clientId: string, campaignId: string) => {
		const campaignKey = `${clientId}-${campaignId}`;
		setExpandedCampaigns(prev => ({
			...prev,
			[campaignKey]: !prev[campaignKey]
		}));
	};

	// Pagination
	const totalItems = Object.keys(groupedJobs).length;
	const totalPages = Math.ceil(totalItems / itemsPerPage);
	const paginatedClientIds = Object.keys(groupedJobs).slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	const renderPagination = () => {
		if (totalPages <= 1) return null;

		return (
			<Pagination className="mt-4">
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious
							onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
							className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
						/>
					</PaginationItem>

					{Array.from({ length: totalPages }).map((_, i) => (
						<PaginationItem key={i}>
							<PaginationLink
								isActive={currentPage === i + 1}
								onClick={() => setCurrentPage(i + 1)}
								className="cursor-pointer"
							>
								{i + 1}
							</PaginationLink>
						</PaginationItem>
					))}

					<PaginationItem>
						<PaginationNext
							onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
							className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		);
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'draft':
				return <Badge variant="outline" className="text-slate-500">{t("jobs.draft")}</Badge>;
			case 'active':
				return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">{t("jobs.active")}</Badge>;
			case 'pending_invoice':
				return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">{t("jobs.pendingInvoice")}</Badge>;
			case 'pending_validation':
				return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">{t("jobs.pendingValidation")}</Badge>;
			case 'pending_payment':
				return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">{t("jobs.pendingPayment")}</Badge>;
			case 'paid':
				return <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">{t("jobs.paid")}</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	if (isLoading) {
		return (
			<DashboardLayout>
				<div className="p-6">
					<div className="flex justify-between items-center mb-6">
						<h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{t("jobs.title")}</h1>
					</div>
					<div className="flex justify-center items-center h-64">
						<p className="text-slate-500 dark:text-slate-400">{t("jobs.loadingJobs")}</p>
					</div>
				</div>
			</DashboardLayout>
		);
	}

	if (error) {
		return (
			<DashboardLayout>
				<div className="p-6">
					<div className="flex justify-between items-center mb-6">
						<h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{t("jobs.title")}</h1>
					</div>
					<div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
						<p className="text-red-600 dark:text-red-400">{t("jobs.errorLoadingJobs")}: {(error as Error).message}</p>
					</div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className="p-6">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
					<h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{t("jobs.title")}</h1>
					<Button onClick={() => navigate("/jobs/create")} className="shrink-0">
						<PlusCircle className="mr-2 h-4 w-4" />
						{t("jobs.createNew")}
					</Button>
				</div>

				{data && data.length === 0 ? (
					<div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
						<h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">{t("jobs.noJobsFound")}</h3>
						<p className="text-slate-500 dark:text-slate-400 mb-4">{t("jobs.getStarted")}</p>
						<Button onClick={() => navigate("/jobs/create")}>
							<PlusCircle className="mr-2 h-4 w-4" />
							{t("jobs.createJob")}
						</Button>
					</div>
				) : (
					<>
						<div className="rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
							<div className="bg-slate-50 dark:bg-slate-800/50 p-3 border-b border-slate-200 dark:border-slate-700">
								<div className="flex justify-between items-center">
									<h3 className="font-medium text-slate-900 dark:text-slate-200">{t("clients.title")}</h3>
									<div className="text-sm text-slate-600 dark:text-slate-400">
										{t("jobs.total")}: {data.length} {data.length !== 1 ? t("jobs.plural") : t("jobs.titleSingular")}
									</div>
								</div>
							</div>

							{paginatedClientIds.length > 0 ? (
								paginatedClientIds.map((clientId) => (
									<Collapsible
										key={clientId}
										open={expandedClients[clientId]}
										onOpenChange={() => toggleClientExpansion(clientId)}
										className="border-b border-slate-200 dark:border-slate-700 last:border-b-0"
									>
										<CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer">
											<div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
												{expandedClients[clientId] ? (
													<ChevronDown className="h-4 w-4 text-slate-500" />
												) : (
													<ChevronRight className="h-4 w-4 text-slate-500" />
												)}
												{groupedJobs[clientId].clientName}
											</div>
											<div className="text-sm text-slate-500 dark:text-slate-400">
												{Object.keys(groupedJobs[clientId].campaigns).length} {t("campaigns.title")}
											</div>
										</CollapsibleTrigger>
										<CollapsibleContent>
											<div className="pl-6 pr-4 pb-1">
												{Object.keys(groupedJobs[clientId].campaigns).map((campaignId) => {
													const campaignData = groupedJobs[clientId].campaigns[campaignId];
													const campaignKey = `${clientId}-${campaignId}`;

													return (
														<Collapsible
															key={campaignId}
															open={expandedCampaigns[campaignKey]}
															onOpenChange={() => toggleCampaignExpansion(clientId, campaignId)}
															className="mb-2 border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden"
														>
															<CollapsibleTrigger className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer border-b border-slate-200 dark:border-slate-700">
																<div className="flex items-center gap-2">
																	{expandedCampaigns[campaignKey] ? (
																		<ChevronDown className="h-4 w-4 text-slate-500" />
																	) : (
																		<ChevronRight className="h-4 w-4 text-slate-500" />
																	)}
																	<span className="font-medium text-slate-800 dark:text-slate-200">
																		{campaignData.campaignName}
																	</span>
																</div>
																<div className="text-sm text-slate-500 dark:text-slate-400">
																	{campaignData.jobs.length} {campaignData.jobs.length !== 1 ? t("jobs.plural") : t("jobs.titleSingular")}
																</div>
															</CollapsibleTrigger>

															<CollapsibleContent>
																<Table>
																	<TableHeader>
																		<TableRow>
																			<TableHead>{t("jobs.manager")}</TableHead>
																			<TableHead>{t("jobs.provider")}</TableHead>
																			<TableHead>{t("jobs.months")}</TableHead>
																			<TableHead>{t("jobs.value")}</TableHead>
																			<TableHead>{t("jobs.status")}</TableHead>
																			<TableHead>{t("jobs.invoice")}</TableHead>
																			<TableHead className="text-right">{t("jobs.actions")}</TableHead>
																		</TableRow>
																	</TableHeader>
																	<TableBody>
																		{campaignData.jobs.map((job) => (
																			<TableRow
																				key={job.id}
																				onClick={() => navigate(`/jobs/edit/${job.id}`)}
																				className="cursor-pointer"
																			>
																				<TableCell>{job.manager_name}</TableCell>
																				<TableCell>{job.provider_name}</TableCell>
																				<TableCell>{job.months.map(month => t(`common.${month}`)).join(", ")}</TableCell>
																				<TableCell>{formatCurrency(job.value, job.currency)}</TableCell>
																				<TableCell>{getStatusBadge(job.status)}</TableCell>
																				<TableCell className="w-2">
																					{job.documents && job.documents.length > 0 ? (
																						<Link to={job.documents[0]} onClick={e => e.stopPropagation()} target="_blank">
																							<Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800/30">
																								{job.documents[0]}
																							</Badge>
																						</Link>
																					) : (
																						<span className="text-slate-400 text-sm">-</span>
																					)}
																				</TableCell>
																				<TableCell className="text-right">
																					<div className="flex justify-end gap-2">
																						<button
																							onClick={(e) => handleDeleteClick(e, job)}
																							className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950/20"
																						>
																							<Trash2 className="h-4 w-4" />
																							<span className="sr-only">{t("common.delete")}</span>
																						</button>
																					</div>
																				</TableCell>
																			</TableRow>
																		))}
																	</TableBody>
																</Table>
															</CollapsibleContent>
														</Collapsible>
													);
												})}
											</div>
										</CollapsibleContent>
									</Collapsible>
								))
							) : (
								<div className="p-4 text-center text-slate-500 dark:text-slate-400">
									{t("jobs.noJobsToDisplay")}
								</div>
							)}
						</div>

						{renderPagination()}
					</>
				)}
			</div>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("jobs.deleteJob")}</AlertDialogTitle>
						<AlertDialogDescription>
							{t("jobs.deleteConfirmation")}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
						<AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
							{t("common.delete")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</DashboardLayout>
	);
};

export default JobsGroupedList;
