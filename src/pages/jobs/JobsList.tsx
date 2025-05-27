import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
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
import { PlusCircle, Trash2 } from "lucide-react";
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
import { useJobsData, formatCurrency } from "@/hooks/useJobsData";
import { Job } from "@/types/job";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { useModalState } from "@/hooks/useModalState";
import JobModal from "@/components/jobs/JobModal";

const JobsAllList: React.FC = () => {
	const { t } = useTranslation();
	const [searchParams, setSearchParams] = useSearchParams();
	const [currentPage, setCurrentPage] = useState(1);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
	const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [paymentFilter, setPaymentFilter] = useState<string>("all");
	const itemsPerPage = 10;
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const { openModal } = useModalState();

	// Update URL when search term changes
	useEffect(() => {
		const newParams = new URLSearchParams(searchParams);
		if (searchTerm) {
			newParams.set("search", searchTerm);
		} else {
			newParams.delete("search");
		}
		setSearchParams(newParams);
	}, [searchTerm, setSearchParams, searchParams]);

	const handleCreateJob = () => {
		openModal("job", "create");
	};

	const handleEditJob = (id: string) => {
		openModal("job", "edit", id);
	};

	// Use the shared hook to fetch jobs data
	const { data, isLoading, error } = useJobsData();

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

	// Filter jobs based on search term and filters
	const filteredJobs = React.useMemo(() => {
		if (!data) return [];

		return data.filter((job) => {
			const matchesSearch = searchTerm === "" ||
				job.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				job.campaign_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				job.provider_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				job.manager_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				job.invoice_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				job.id.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesStatus = statusFilter === "all" || job.status === statusFilter;
			const matchesPayment = paymentFilter === "all" ||
				(paymentFilter === "paid") ||
				(paymentFilter === "pending");

			return matchesSearch && matchesStatus && matchesPayment;
		});
	}, [data, searchTerm, statusFilter, paymentFilter]);

	// Pagination
	const totalItems = filteredJobs.length;
	const totalPages = Math.ceil(totalItems / itemsPerPage);
	const paginatedJobs = filteredJobs.slice(
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
					<Button onClick={handleCreateJob} className="shrink-0">
						<PlusCircle className="mr-2 h-4 w-4" />
						{t("jobs.createNew")}
					</Button>
				</div>

				{data && data.length === 0 ? (
					<div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
						<h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">{t("jobs.noJobsFound")}</h3>
						<p className="text-slate-500 dark:text-slate-400 mb-4">{t("jobs.getStarted")}</p>
						<Button onClick={handleCreateJob}>
							<PlusCircle className="mr-2 h-4 w-4" />
							{t("jobs.createNew")}
						</Button>
					</div>
				) : (
					<>
						<div className="flex flex-col md:flex-row gap-4 mb-6">
							<div className="flex-1">
								<Input
									placeholder={t("jobs.searchJobs")}
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="max-w-md"
								/>
							</div>
							<div className="flex flex-row gap-2">
								<Select value={statusFilter} onValueChange={setStatusFilter}>
									<SelectTrigger className="w-[180px]">
										<SelectValue placeholder={t("jobs.filterByStatus")} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">{t("jobs.allStatuses")}</SelectItem>
										<SelectItem value="draft">{t("jobs.draft")}</SelectItem>
										<SelectItem value="active">{t("jobs.active")}</SelectItem>
										<SelectItem value="pending_invoice">{t("jobs.pendingInvoice")}</SelectItem>
										<SelectItem value="pending_validation">{t("jobs.pendingValidation")}</SelectItem>
										<SelectItem value="pending_payment">{t("jobs.pendingPayment")}</SelectItem>
										<SelectItem value="paid">{t("jobs.paid")}</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>{t("jobs.status")}</TableHead>
										<TableHead>{t("jobs.jobType")}</TableHead>
										<TableHead>{t("jobs.client")}</TableHead>
										<TableHead>{t("jobs.campaign")}</TableHead>
										<TableHead>{t("jobs.manager")}</TableHead>
										<TableHead>{t("jobs.provider")}</TableHead>
										<TableHead>{t("jobs.months")}</TableHead>
										<TableHead>{t("jobs.value")}</TableHead>
										<TableHead>{t("jobs.date")}</TableHead>
										<TableHead>{t("jobs.providerEmailSent")}</TableHead>
										<TableHead>{t("jobs.invoice")}</TableHead>
										<TableHead>{t("jobs.reference")}</TableHead>
										<TableHead className="text-right">{t("jobs.actions")}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{paginatedJobs.map((job) => (
										<TableRow key={job.id} onClick={() => handleEditJob(job.id)} className="cursor-pointer">
											<TableCell>{getStatusBadge(job.status)}</TableCell>
											<TableCell>{job.job_type_name || t("jobs.unknownJobType")}</TableCell>
											<TableCell className="font-medium">{job.client_name || t("jobs.unknownClient")}</TableCell>
											<TableCell>{job.campaign_name || t("jobs.unknownCampaign")}</TableCell>
											<TableCell>{job.manager_name || t("jobs.unknownManager")}</TableCell>
											<TableCell>{job.provider_name || t("jobs.unknownProvider")}</TableCell>
											<TableCell>{job.months.map(month => t(`common.${month}`)).join(", ")}</TableCell>
											<TableCell>{formatCurrency(job.value, job.currency)}</TableCell>
											<TableCell>{job.due_date ? new Date(job.due_date).toLocaleDateString() : t("jobs.unknownDate")}</TableCell>
											<TableCell>{job.provider_email_sent ? new Date(job.provider_email_sent).toLocaleDateString() : <span className="text-slate-400 text-sm">-</span>}</TableCell>
											<TableCell className="w-2">
												{job.documents && job.documents.length > 0 ? (
													<Link to={job.documents[0]} onClick={e => e.stopPropagation()} target="_blank">
														<Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800/30">
															Document
														</Badge>
													</Link>
												) : (
													<span className="text-slate-400 text-sm">-</span>
												)}
											</TableCell>
											<TableCell>{job.invoice_reference || <span className="text-slate-400 text-sm">-</span>}</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end space-x-2">
													<Link
														onClick={(e) => handleDeleteClick(e, job)}
														to={null}
														className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950/20"
													>
														<Trash2 className="h-4 w-4" />
														<span className="sr-only">{t("common.delete")}</span>
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
				<JobModal />
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
			</div>
		</DashboardLayout>
	);
};

export default JobsAllList;
