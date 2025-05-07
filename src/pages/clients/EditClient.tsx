import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useTranslation } from "react-i18next";
import EditPageLayout from "@/components/common/EditPageLayout";
import FormActions from "@/components/common/FormActions";
import ActiveSwitchField from "@/components/common/ActiveSwitchField";

const EditClient = () => {
	const { t } = useTranslation();
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	// Define form validation schema
	const clientFormSchema = z.object({
		name: z.string().min(1, t("clients.clientName") + " " + t("common.isRequired")).max(100, t("clients.clientName") + " " + t("common.maxLength", { count: 100 }) ),
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
				console.error("Error fetching client:", error.message);
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
				.select()
				.single();

			if (error) {
				console.error("Error updating client:", error.message);
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
		onError: (error: Error) => {
			console.error("Mutation error:", error.message);
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

	return (
		<EditPageLayout
			title={t("clients.editClient")}
			description={t("clients.updateClientDescription")}
			isLoading={isLoading}
			isError={isError || (!isLoading && !client)}
			loadingText={t("clients.loadingClientData")}
			errorText={t("clients.errorLoadingClientData")}
			backPath="/clients"
			backButtonText={t("clients.backToClients")}
		>
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

					<ActiveSwitchField
						control={form.control}
						name="active"
						description={t("clients.activeDescription")}
					/>
					
					<FormActions
						onCancel={() => navigate("/clients")}
						isSaving={updateClientMutation.isPending}
						backButton={{
							text: t("clients.backToClients"),
							onClick: () => navigate("/clients"),
						}}
					/>
				</form>
			</Form>
		</EditPageLayout>
	);
};

export default EditClient;
