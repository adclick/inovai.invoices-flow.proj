import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox"; // Not used
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
import { useTranslation } from "react-i18next";
import EditPageLayout from "@/components/common/EditPageLayout";
import FormActions from "@/components/common/FormActions";
import ActiveSwitchField from "@/components/common/ActiveSwitchField";

// Zod schema type will be inferred by the component
let campaignSchema: z.ZodObject<any>; 

type CampaignFormValues = z.infer<typeof campaignSchema> & {
	duration: number; // ensure duration is number, zod coerces
	estimated_cost?: number;
	revenue?: number;
};

const EditCampaign = () => {
	const { t } = useTranslation();
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	// Schema for campaign form validation
	campaignSchema = z.object({
		name: z.string().min(2, t("campaigns.nameError")).max(100, t("campaigns.nameErrorMax", { count: 100 })),
		client_id: z.string().min(1, t("campaigns.clientError")),
		duration: z.coerce.number().min(1, t("campaigns.durationError")),
		estimated_cost: z.coerce.number().optional(),
		revenue: z.coerce.number().optional(),
		active: z.boolean().default(true),
	});

	// Fetch campaign details
	const { data: campaign, isLoading: isLoadingCampaign, isError } = useQuery({
		queryKey: ["campaign", id],
		queryFn: async () => {
			if (!id) throw new Error("Campaign ID is required");

			const { data, error } = await supabase
				.from("campaigns")
				.select("*")
				.eq("id", id)
				.single();

			if (error) {
        console.error("Error fetching campaign:", error.message);
        throw error;
      }
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
        .eq("active", true) // Typically, only active clients should be selectable
				.order("name");

			if (error) {
        console.error("Error fetching clients:", error.message);
        throw error;
      }
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
				.update(values) // values already match CampaignFormValues structure
				.eq("id", id)
				.select("id")
				.single();

			if (error) {
        console.error("Error updating campaign:", error.message);
        throw error;
      }
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
		onError: (error: Error) => {
			console.error("Mutation error:", error.message);
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

	return (
    <EditPageLayout
      title={t("campaigns.editCampaign")}
      description={t("campaigns.updateCampaignDescription")}
      isLoading={isLoadingCampaign}
      isError={isError || (!isLoadingCampaign && !campaign)}
      loadingText={t("campaigns.loadingCampaignDetails")}
      errorText={t("campaigns.campaignNotFound")}
      backPath="/campaigns"
      backButtonText={t("campaigns.backToCampaigns")}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("common.name")}</FormLabel>
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
                  disabled={isLoadingClients}
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

          {/* TODO: Add fields for duration, estimated_cost, revenue if they need to be editable */}
          {/* For now, keeping them out of the form as they were not in the original form's visible fields */}

          <ActiveSwitchField
            control={form.control}
            name="active"
            description={t("campaigns.activeDescription")}
          />

          <FormActions
            onCancel={() => navigate("/campaigns")}
            isSaving={updateCampaign.isPending}
            saveText={t("common.save")}
            backButton={{
              text: t("campaigns.backToCampaigns"), // Added back button to actions
              onClick: () => navigate("/campaigns"),
            }}
          />
        </form>
      </Form>
    </EditPageLayout>
  );
};

export default EditCampaign;
