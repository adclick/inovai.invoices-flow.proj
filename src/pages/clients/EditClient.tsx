import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";

const EditClient = () => {
	const { t } = useTranslation();
	const { id } = useParams();
	const navigate = useNavigate();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	// Define form validation schema
	const clientFormSchema = z.object({
		name: z.string().min(1, t("clients.clientName") + " " + t("common.error")).max(100, t("clients.clientName") + " " + t("common.error")),
		active: z.boolean().default(true),
	});

	type ClientFormValues = z.infer<typeof clientFormSchema>;

	// Initialize form
	const form = useForm<ClientFormValues>({
		resolver: zodResolver(clientFormSchema),
		defaultValues: {
			name: "",
			active: true,
		},
	});

	// Fetch client data
	const { data: client, isLoading, isError } = useQuery({
		queryKey: ["client", id],
		queryFn: async () => {
			if (!id) throw new Error("Client ID is required");

			const { data, error } = await supabase
				.from("clients")
				.select("*")
				.eq("id", id)
				.single();

			if (error) {
				throw new Error(error.message);
			}
			return data;
		},
		enabled: !!id,
	});

	// Update form values when client data is loaded
	useEffect(() => {
		if (client) {
			form.reset({
				name: client.name,
				active: client.active,
			});
		}
	}, [client, form]);

	// Update client mutation
	const updateClientMutation = useMutation({
		mutationFn: async (values: ClientFormValues) => {
			if (!id) throw new Error("Client ID is required");

			const { data, error } = await supabase
				.from("clients")
				.update({
					name: values.name,
					active: values.active,
					updated_at: new Date().toISOString(),
				})
				.eq("id", id)
				.select();

			if (error) {
				throw new Error(error.message);
			}
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["clients"] });
			queryClient.invalidateQueries({ queryKey: ["client", id] });
			toast({
				title: t("clients.clientUpdated"),
				description: t("clients.clientUpdatedDescription"),
			});
			navigate("/clients");
		},
		onError: (error) => {
			toast({
				title: t("common.error"),
				description: t("clients.clientUpdateError"),
				variant: "destructive",
			});
		},
	});

	// Form submission handler
	const onSubmit = (values: ClientFormValues) => {
		updateClientMutation.mutate(values);
	};

	if (isLoading) {
		return (
			<DashboardLayout>
				<div className="p-6">
					<div className="mb-6">
						<Button variant="ghost" onClick={() => navigate("/clients")}>
							<ArrowLeft className="mr-2 h-4 w-4" />
							{t("clients.backToClients")}
						</Button>
					</div>
					<div className="flex justify-center items-center h-64">
						<p>{t("clients.loadingClientData")}</p>
					</div>
				</div>
			</DashboardLayout>
		);
	}

	if (isError || !client) {
		return (
			<DashboardLayout>
				<div className="p-6">
					<div className="mb-6">
						<Button variant="ghost" onClick={() => navigate("/clients")}>
							<ArrowLeft className="mr-2 h-4 w-4" />
							{t("clients.backToClients")}
						</Button>
					</div>
					<div className="flex justify-center items-center h-64">
						<p className="text-red-500">{t("clients.errorLoadingClientData")}</p>
					</div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className="p-6 max-w-4xl mx-auto">
				<div className="mb-6">
					<h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{t("clients.editClient")}</h1>
					<p className="text-slate-500 dark:text-slate-400 mt-1">
						{t("clients.updateClientDescription")}
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
										<FormLabel>{t("clients.clientName")}</FormLabel>
										<FormControl>
											<Input placeholder={t("clients.enterClientName")} {...field} />
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
											<FormLabel className="text-sm">{t("clients.activeClient")}</FormLabel>
											<div className="text-sm text-muted-foreground">
												{t("clients.markAsActive")}
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

							<div className="flex justify-between pt-4">
								<Button variant="outline" onClick={() => navigate("/clients")}>
									<ArrowLeft className="mr-2 h-4 w-4" />
									{t("clients.backToClients")}
								</Button>
								<div className="flex justify-end space-x-4">
									<Button
										type="button"
										variant="outline"
										onClick={() => navigate("/clients")}
									>
										{t("common.cancel")}
									</Button>
									<Button
										type="submit"
										disabled={updateClientMutation.isPending}
									>
										{updateClientMutation.isPending ? t("clients.saving") : t("clients.saveChanges")}
									</Button>
								</div>
							</div>
						</form>
					</Form>
				</div>
			</div>
		</DashboardLayout>
	);
};

export default EditClient;
