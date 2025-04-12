
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

type Campaign = {
	id: string;
	name: string;
	active: boolean;
	client_id: string;
	client_name?: string;
	duration: number;
	estimated_cost: number | null;
	revenue: number | null;
	created_at: string;
};

const CampaignsList = () => {
	const [currentPage, setCurrentPage] = useState(1);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);
	const itemsPerPage = 10;
	const { toast } = useToast();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	// Query to fetch campaigns with client names
	const { data, isLoading, error } = useQuery({
		queryKey: ["campaigns"],
		queryFn: async () => {
			// First fetch all campaigns
			const { data: campaigns, error: campaignsError } = await supabase
				.from("campaigns")
				.select("*")
				.order("created_at", { ascending: false });

			if (campaignsError) throw campaignsError;

			// Fetch all clients to get their names
			const { data: clients, error: clientsError } = await supabase
				.from("clients")
				.select("id, name");

			if (clientsError) throw clientsError;

			// Create a lookup table for client names
			const clientMap = clients.reduce((acc: Record<string, string>, client) => {
				acc[client.id] = client.name;
				return acc;
			}, {});

			// Add client names to campaigns
			return campaigns.map((campaign: Campaign) => ({
				...campaign,
				client_name: clientMap[campaign.client_id] || "Unknown Client"
			}));
		},
	});

	// Delete campaign mutation
	const deleteCampaign = useMutation({
		mutationFn: async (id: string) => {
			const { error } = await supabase
				.from("campaigns")
				.delete()
				.eq("id", id);

			if (error) throw error;
			return id;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["campaigns"] });
			toast({
				title: "Campaign deleted",
				description: "The campaign has been successfully deleted.",
			});
			setIsDeleteDialogOpen(false);
			setCampaignToDelete(null);
		},
		onError: (error) => {
			console.error("Error deleting campaign:", error);
			toast({
				title: "Error",
				description: "Failed to delete the campaign. Please try again.",
				variant: "destructive",
			});
		},
	});

	// Handle delete confirmation
	const handleDeleteClick = (campaign: Campaign) => {
		setCampaignToDelete(campaign);
		setIsDeleteDialogOpen(true);
	};

	const confirmDelete = () => {
		if (campaignToDelete) {
			deleteCampaign.mutate(campaignToDelete.id);
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

	if (isLoading) {
		return (
			<DashboardLayout>
				<div className="p-6">
					<div className="flex justify-between items-center mb-6">
						<h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Campaigns</h1>
					</div>
					<div className="flex justify-center items-center h-64">
						<p className="text-slate-500 dark:text-slate-400">Loading campaigns...</p>
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
						<h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Campaigns</h1>
					</div>
					<div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
						<p className="text-red-600 dark:text-red-400">Error loading campaigns: {(error as Error).message}</p>
					</div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className="p-6">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
					<h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Campaigns</h1>
					<Button onClick={() => navigate("/campaigns/create")} className="shrink-0">
						<PlusCircle className="mr-2 h-4 w-4" />
						New Campaign
					</Button>
				</div>

				{paginatedData.length === 0 ? (
					<div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
						<h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No campaigns found</h3>
						<p className="text-slate-500 dark:text-slate-400 mb-4">Get started by creating your first campaign.</p>
						<Button onClick={() => navigate("/campaigns/create")}>
							<PlusCircle className="mr-2 h-4 w-4" />
							Create Campaign
						</Button>
					</div>
				) : (
					<>
						<div className="rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Client</TableHead>
										<TableHead>Duration</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Estimated Cost</TableHead>
										<TableHead>Revenue</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{paginatedData.map((campaign) => (
										<TableRow key={campaign.id} onClick={() => navigate(`/campaigns/edit/${campaign.id}`)} className="cursor-pointer">
											<TableCell className="font-medium">{campaign.name}</TableCell>
											<TableCell>{campaign.client_name}</TableCell>
											<TableCell>{campaign.duration} days</TableCell>
											<TableCell>
												<span className={`px-2 py-1 rounded-full text-xs font-medium ${campaign.active
														? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
														: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
													}`}>
													{campaign.active ? "Active" : "Inactive"}
												</span>
											</TableCell>
											<TableCell>
												{campaign.estimated_cost ? `$${campaign.estimated_cost.toLocaleString()}` : "—"}
											</TableCell>
											<TableCell>
												{campaign.revenue ? `$${campaign.revenue.toLocaleString()}` : "—"}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end gap-2">
													<Link
														onClick={e =>{ e.stopPropagation(); handleDeleteClick(campaign)}}
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
							You are about to delete the campaign "{campaignToDelete?.name}". This action cannot be undone.
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

export default CampaignsList;
