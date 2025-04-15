
import React from "react";
import { useNavigate } from "react-router-dom";
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

const CreateCampaign = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	// Schema for campaign form validation
	const campaignSchema = z.object({
		name: z.string().min(2, t("campaigns.campaignName") + " " + t("common.error")),
		client_id: z.string().min(1, t("campaigns.selectClient")),
		duration: z.coerce.number().min(1, t("campaigns.duration") + " " + t("common.error")),
		estimated_cost: z.coerce.number().nullable().optional(),
		revenue: z.coerce.number().nullable().optional(),
		active: z.boolean().default(true),
	}).required();

	type CampaignFormValues = z.infer<typeof campaignSchema>;

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
			estimated_cost: null,
			revenue: null,
			active: true,
		},
	});

	// Create campaign mutation
	const createCampaign = useMutation({
		mutationFn: async (values: CampaignFormValues) => {
			const { data, error } = await supabase
				.from("campaigns")
				.insert({
					name: values.name,
					client_id: values.client_id,
					duration: values.duration,
					estimated_cost: values.estimated_cost,
					revenue: values.revenue,
					active: values.active
				})
				.select("id")
				.single();

			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["campaigns"] });
			toast({
				title: t("campaigns.campaignCreated"),
			});
			navigate("/campaigns");
		},
		onError: (error) => {
			console.error("Error creating campaign:", error);
			toast({
				title: t("common.error"),
				description: t("campaigns.campaignCreated"),
				variant: "destructive",
			});
		},
	});

	// Form submission handler
	const onSubmit = (values: CampaignFormValues) => {
		createCampaign.mutate(values);
	};

	return (
		<DashboardLayout>
			<div className="p-6 max-w-4xl mx-auto">
				<div className="mb-6">
					<h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{t("campaigns.createNew")}</h1>
					<p className="text-slate-500 dark:text-slate-400 mt-1">
						{t("campaigns.campaignDetails")}
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
										<FormLabel>{t("campaigns.campaignName")}</FormLabel>
										<FormControl>
											<Input placeholder={t("campaigns.campaignName")} {...field} />
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
											defaultValue={field.value}
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
												min="1"
												placeholder={t("campaigns.duration")}
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
											<FormLabel className="text-sm">{t("campaigns.active")}</FormLabel>
											<div className="text-sm text-muted-foreground">
												{t("campaigns.activeDescription")}
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
								<Button type="submit" disabled={createCampaign.isPending}>
									{createCampaign.isPending ? t("common.creating") : t("campaigns.createNew")}
								</Button>
							</div>
						</form>
					</Form>
				</div>
			</div>
		</DashboardLayout>
	);
};

export default CreateCampaign;
