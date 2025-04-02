
import React, { useState } from "react";
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
import { PlusCircle, Edit, Trash2 } from "lucide-react";
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

type Job = {
	id: string;
	client_id: string;
	campaign_id: string;
	provider_id: string;
	manager_id: string;
	value: number;
	currency: string;
	status: string;
	paid: boolean;
	manager_ok: boolean;
	months: string[];
	created_at: string;
	client_name?: string;
	campaign_name?: string;
	provider_name?: string;
	manager_name?: string;
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

const JobsList = () => {
	const [currentPage, setCurrentPage] = useState(1);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
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

			// Fetch related entities to get their names
			const { data: clients } = await supabase
				.from("clients")
				.select("id, name");

			const { data: campaigns } = await supabase
				.from("campaigns")
				.select("id, name");

			const { data: providers } = await supabase
				.from("providers")
				.select("id, name");

			const { data: managers } = await supabase
				.from("managers")
				.select("id, name");

			// Create lookup tables for entity names
			const clientMap = clients?.reduce((acc: Record<string, string>, client) => {
				acc[client.id] = client.name;
				return acc;
			}, {}) || {};

			const campaignMap = campaigns?.reduce((acc: Record<string, string>, campaign) => {
				acc[campaign.id] = campaign.name;
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
			return jobs.map((job: Job) => ({
				...job,
				client_name: clientMap[job.client_id] || "Unknown Client",
				campaign_name: campaignMap[job.campaign_id] || "Unknown Campaign",
				provider_name: providerMap[job.provider_id] || "Unknown Provider",
				manager_name: managerMap[job.manager_id] || "Unknown Manager"
			}));
		},
	});

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
				title: "Job deleted",
				description: "The job has been successfully deleted.",
			});
			setIsDeleteDialogOpen(false);
			setJobToDelete(null);
		},
		onError: (error) => {
			console.error("Error deleting job:", error);
			toast({
				title: "Error",
				description: "Failed to delete the job. Please try again.",
				variant: "destructive",
			});
		},
	});

	// Handle delete confirmation
	const handleDeleteClick = (job: Job) => {
		setJobToDelete(job);
		setIsDeleteDialogOpen(true);
	};

	const confirmDelete = () => {
		if (jobToDelete) {
			deleteJob.mutate(jobToDelete.id);
		}
	};

	// Pagination
	const totalPages = data ? Math.ceil(data.length / itemsPerPage) : 0;
	const paginatedData = data
		? data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
		: [];

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
			case 'active':
				return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Active</Badge>;
			case 'inactive':
				return <Badge variant="outline" className="text-slate-500">Inactive</Badge>;
			case 'closed':
				return <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">Closed</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	if (isLoading) {
		return (
			<DashboardLayout>
				<div className="p-6">
					<div className="flex justify-between items-center mb-6">
						<h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Jobs</h1>
					</div>
					<div className="flex justify-center items-center h-64">
						<p className="text-slate-500 dark:text-slate-400">Loading jobs...</p>
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
						<h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Jobs</h1>
					</div>
					<div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
						<p className="text-red-600 dark:text-red-400">Error loading jobs: {(error as Error).message}</p>
					</div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className="p-6">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
					<h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Jobs</h1>
					<Button onClick={() => navigate("/jobs/create")} className="shrink-0">
						<PlusCircle className="mr-2 h-4 w-4" />
						New Job
					</Button>
				</div>

				{paginatedData.length === 0 ? (
					<div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
						<h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No jobs found</h3>
						<p className="text-slate-500 dark:text-slate-400 mb-4">Get started by creating your first job.</p>
						<Button onClick={() => navigate("/jobs/create")}>
							<PlusCircle className="mr-2 h-4 w-4" />
							Create Job
						</Button>
					</div>
				) : (
					<>
						<div className="rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Client</TableHead>
										<TableHead>Campaign</TableHead>
										<TableHead>Provider</TableHead>
										<TableHead>Manager</TableHead>
										<TableHead>Value</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Payment</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{paginatedData.map((job) => (
										<TableRow key={job.id} onClick={() => navigate(`/jobs/edit/${job.id}`)} className="cursor-pointer">
											<TableCell>{job.client_name}</TableCell>
											<TableCell>{job.campaign_name}</TableCell>
											<TableCell>{job.provider_name}</TableCell>
											<TableCell>{job.manager_name}</TableCell>
											<TableCell>{formatCurrency(job.value, job.currency)}</TableCell>
											<TableCell>{getStatusBadge(job.status)}</TableCell>
											<TableCell>
												<span className={`px-2 py-1 rounded-full text-xs font-medium ${job.paid
													? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
													: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
													}`}>
													{job.paid ? "Paid" : "Pending"}
												</span>
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end gap-2">
													<Link
														to={`/jobs/edit/${job.id}`}
														className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3 hover:bg-gray-200 dark:text-gray-700 dark:hover:bg-red-950/20"
													>
														<Edit className="h-4 w-4" />
														<span className="sr-only">Edit</span>
													</Link>
													<Link
														onClick={e =>{ e.stopPropagation(); handleDeleteClick(job)}}
														to={null}
														className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950/20"
													>
														<Trash2 className="h-4 w-4" />
														<span className="sr-only">Delete</span>
													</Link>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>

						{renderPagination()}
					</>
				)}
			</div>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							You are about to delete this job. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</DashboardLayout>
	);
};

export default JobsList;
