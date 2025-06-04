
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import RequiredTextField from "@/components/common/form/RequiredTextField";
import EntitySelectField from "@/components/common/form/EntitySelectField";
import ActiveSwitchField from "../common/ActiveSwitchField";
import { BaseEntityFormProps } from "../common/EntityModal";
import { useEntityMutation } from "@/hooks/useEntityMutation";
import { useEntityQuery, useEntitiesQuery } from "@/hooks/useEntityQuery";

// Form schema with validation that matches the database schema
const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  client_id: z.string().min(1, { message: "Client is required" }),
  duration: z.coerce.number().min(1, { message: "Duration must be at least 1 month" }),
  estimated_cost: z.coerce.number().optional(),
  revenue: z.coerce.number().optional(),
  active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

const CampaignForm: React.FC<BaseEntityFormProps> = ({
  id,
  mode,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation();
  const isEditMode = mode === "edit";

  // Setup form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      client_id: "",
      duration: 1,
      estimated_cost: undefined,
      revenue: undefined,
      active: true,
    },
  });

  // Fetch clients for selection
  const { data: clients, isLoading: clientsLoading } = useEntitiesQuery("clients", {
    select: "id, name",
    orderBy: "name",
  });

  // Fetch campaign data if in edit mode
  const { isLoading } = useEntityQuery({
    tableName: "campaigns",
    entityName: "campaign",
    id,
    enabled: isEditMode && !!id,
    select: "*",
  });

  // Load campaign data into form when fetched
  React.useEffect(() => {
    if (isEditMode && id) {
      // This will be handled by the useEntityQuery hook
      const loadCampaign = async () => {
        try {
          const { data } = await supabase
            .from("campaigns")
            .select("*")
            .eq("id", id)
            .single();
          
          if (data) {
            form.reset({
              name: data.name,
              client_id: data.client_id,
              duration: data.duration,
              estimated_cost: data.estimated_cost || undefined,
              revenue: data.revenue || undefined,
              active: data.active,
            });
          }
        } catch (error) {
          console.error("Error loading campaign:", error);
        }
      };
      loadCampaign();
    }
  }, [isEditMode, id, form]);

  // Mutations
  const { createMutation, updateMutation } = useEntityMutation({
    tableName: "campaigns",
    entityName: "campaigns",
    queryKey: "campaigns",
    onSuccess,
    onClose,
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Form submission handler
  const onSubmit = (values: FormValues) => {
    const submitData = {
      name: values.name,
      client_id: values.client_id,
      duration: values.duration,
      estimated_cost: values.estimated_cost || null,
      revenue: values.revenue || null,
      active: values.active,
    };

    if (isEditMode && id) {
      updateMutation.mutate({ id, values: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <EntitySelectField
          control={form.control}
          name="client_id"
          label={t("campaigns.client")}
          placeholder={t("campaigns.selectClient")}
          options={clients || []}
          isLoading={clientsLoading}
          emptyMessage={t("clients.noClientsAvailable")}
        />

        <RequiredTextField
          control={form.control}
          name="name"
          label={t("campaigns.campaignName")}
          placeholder={t("campaigns.enterCampaignName")}
          disabled={isLoading}
        />

        <RequiredTextField
          control={form.control}
          name="duration"
          label={t("campaigns.duration")}
          placeholder={t("campaigns.enterDuration")}
          type="number"
          min="1"
          disabled={isLoading}
        />

        <RequiredTextField
          control={form.control}
          name="estimated_cost"
          label={t("campaigns.estimatedCost")}
          placeholder={t("campaigns.enterEstimatedCost")}
          type="number"
          min="0"
          step="0.01"
          disabled={isLoading}
        />

        <RequiredTextField
          control={form.control}
          name="revenue"
          label={t("campaigns.revenue")}
          placeholder={t("campaigns.enterRevenue")}
          type="number"
          min="0"
          step="0.01"
          disabled={isLoading}
        />

        <ActiveSwitchField 
          control={form.control}
          name="active" 
          label={t("common.status")}
          description={t("campaigns.activeDescription")}
        />

        <div className="flex justify-end space-x-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            {t("common.cancel")}
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting
              ? t("common.saving")
              : isEditMode
                ? t("common.update")
                : t("common.create")
            }
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CampaignForm;
