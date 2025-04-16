import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";

type CampaignFormValues = {
	name: string;
	client_id: string;
	duration: number;
	estimated_cost?: number;
	revenue?: number;
	active: boolean;
};

const EditCampaign = () => {
	const { t } = useTranslation();
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	// Schema for campaign form validation
	const campaignSchema = z.object({
		name: z.string().min(2, t("campaigns.nameError")).max(100, t("campaigns.nameError")),
		client_id: z.string().min(1, t("campaigns.clientError")),
		duration: z.coerce.number().min(1, t("campaigns.durationError")),
		estimated_cost: z.coerce.number().optional(),
		revenue: z.coerce.number().optional(),
		active: z.boolean().default(true),
	});

	// Fetch campaign details
	const { data: campaign, isLoading: isLoadingCampaign } = useQuery({
		queryKey: ["campaign", id],
		queryFn: async () => {
			if (!id) throw new Error("Campaign ID is required");

			const { data, error } = await supabase
				.from("campaigns")
				.select("*")
				.eq("id", id)
				.single();

			if (error) throw error;
			return data;
		},
		enabled: !!id,
	});

	// Fetch clients for the dropdown
	const { data: clients, isLoading: isLoadingClients } = useQuery({
		queryKey: ["clients"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("clients")
				.select("id, name")
				.order("name");

			if (error) throw error;
			return data;
		},
	});

	// Form setup
	const form = useForm<CampaignFormValues>({
		resolver: zodResolver(campaignSchema),
		defaultValues: {
			name: "",
			client_id: "",
			duration: 30,
			estimated_cost: undefined,
			revenue: undefined,
			active: true,
		},
	});

	// Update form values when campaign data is loaded
	useEffect(() => {
		if (campaign) {
			form.reset({
				name: campaign.name,
				client_id: campaign.client_id,
				duration: campaign.duration,
				estimated_cost: campaign.estimated_cost || undefined,
				revenue: campaign.revenue || undefined,
				active: campaign.active,
			});
		}
	}, [campaign, form]);

	// Update campaign mutation
	const updateCampaign = useMutation({
		mutationFn: async (values: CampaignFormValues) => {
			if (!id) throw new Error("Campaign ID is required");

			const { data, error } = await supabase
				.from("campaigns")
				.update(values)
				.eq("id", id)
				.select("id")
				.single();

			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["campaigns"] });
			queryClient.invalidateQueries({ queryKey: ["campaign", id] });
			toast({
				title: t("campaigns.campaignUpdated"),
				description: t("campaigns.campaignUpdatedDescription"),
			});
			navigate("/campaigns");
		},
		onError: (error) => {
			console.error("Error updating campaign:", error);
			toast({
				title: t("common.error"),
				description: t("campaigns.campaignUpdateError"),
				variant: "destructive",
			});
		},
	});

	// Form submission handler
	const onSubmit = (values: CampaignFormValues) => {
		updateCampaign.mutate(values);
	};

	if (isLoadingCampaign) {
		return (
			<DashboardLayout>
				<div className="p-6">
					<div className="flex justify-between items-center mb-6">
						<h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{t("campaigns.editCampaign")}</h1>
					</div>
					<div className="flex justify-center items-center h-64">
						<p className="text-slate-500 dark:text-slate-400">{t("campaigns.loadingCampaignDetails")}</p>
					</div>
				</div>
			</DashboardLayout>
		);
	}

	if (!campaign) {
		return (
			<DashboardLayout>
				<div className="p-6">
					<div className="flex justify-between items-center mb-6">
						<h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{t("campaigns.editCampaign")}</h1>
					</div>
					<div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
						<p className="text-red-600 dark:text-red-400">{t("campaigns.campaignNotFound")}</p>
						<Button
							className="mt-4"
							onClick={() => navigate("/campaigns")}
						>
							{t("campaigns.backToCampaigns")}
						</Button>
					</div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className="p-6 max-w-4xl mx-auto">
				<div className="mb-6">
					<h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{t("campaigns.editCampaign")}</h1>
					<p className="text-slate-500 dark:text-slate-400 mt-1">
						{t("campaigns.updateCampaignDescription")}
					</p>
				</div>

				<div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("campaigns.name")}</FormLabel>
										<FormControl>
											<Input placeholder={t("campaigns.enterCampaignName")} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="client_id"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("campaigns.client")}</FormLabel>
										<Select
											onValueChange={field.onChange}
											value={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder={t("campaigns.selectClient")} />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{isLoadingClients ? (
													<SelectItem value="loading" disabled>
														{t("campaigns.loadingClients")}
													</SelectItem>
												) : clients && clients.length > 0 ? (
													clients.map((client) => (
														<SelectItem key={client.id} value={client.id}>
															{client.name}
														</SelectItem>
													))
												) : (
													<SelectItem value="no-clients" disabled>
														{t("campaigns.noClientsAvailable")}
													</SelectItem>
												)}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="duration"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("campaigns.duration")}</FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder={t("campaigns.enterDuration")}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="estimated_cost"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("campaigns.estimatedCost")}</FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder={t("campaigns.enterEstimatedCost")}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="revenue"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("campaigns.revenue")}</FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder={t("campaigns.enterRevenue")}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="active"
								render={({ field }) => (
									<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
										<div className="space-y-0.5">
											<FormLabel className="text-sm">{t("campaigns.activeCampaign")}</FormLabel>
											<div className="text-sm text-muted-foreground">
												{t("campaigns.markAsActive")}
											</div>
										</div>
										<FormControl>
											<Switch
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<div className="flex justify-end space-x-4 pt-4">
								<Button
									type="button"
									variant="outline"
									onClick={() => navigate("/campaigns")}
								>
									{t("common.cancel")}
								</Button>
								<Button type="submit" disabled={updateCampaign.isPending}>
									{updateCampaign.isPending ? t("common.updating") : t("campaigns.updateCampaign")}
								</Button>
							</div>
						</form>
					</Form>
				</div>
			</div>
		</DashboardLayout>
	);
};

export default EditCampaign;
