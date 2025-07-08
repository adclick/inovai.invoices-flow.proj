
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
import { useEntitiesQuery } from "@/hooks/useEntityQuery";

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
  const { data: clientsData, isLoading: clientsLoading } = useEntitiesQuery("clients", {
    select: "id, name",
    orderBy: "name",
  });

  // Convert clients data to the expected format
  const clients = React.useMemo(() => {
    if (!clientsData || !Array.isArray(clientsData)) return [];
    return clientsData.map((client: any) => ({
      id: client.id,
      name: client.name,
    }));
  }, [clientsData]);

  // Load campaign data into form when fetched
  React.useEffect(() => {
    if (isEditMode && id) {
      const loadCampaign = async () => {
        try {
          const { data, error } = await supabase
            .from("campaigns")
            .select("*")
            .eq("id", id as any)
            .maybeSingle();
          
          if (error) {
            console.error("Error loading campaign:", error);
            return;
          }
          
          if (!data) {
            return;
          }
          
          // Now data is guaranteed to be non-null
          const campaignData = data as any;
          form.reset({
            name: campaignData.name || "",
            client_id: campaignData.client_id || "",
            duration: campaignData.duration || 1,
            estimated_cost: campaignData.estimated_cost || undefined,
            revenue: campaignData.revenue || undefined,
            active: campaignData.active ?? true,
          });
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

  // Form submission handlers
  const handleSave = (values: FormValues) => {
    const submitData = {
      name: values.name,
      client_id: values.client_id,
      duration: values.duration,
      estimated_cost: values.estimated_cost || null,
      revenue: values.revenue || null,
      active: values.active,
    };

    if (isEditMode && id) {
      updateMutation.mutate({ id, values: submitData, shouldClose: false });
    } else {
      createMutation.mutate({ values: submitData, shouldClose: false });
    }
  };

  const handleSaveAndClose = (values: FormValues) => {
    const submitData = {
      name: values.name,
      client_id: values.client_id,
      duration: values.duration,
      estimated_cost: values.estimated_cost || null,
      revenue: values.revenue || null,
      active: values.active,
    };

    if (isEditMode && id) {
      updateMutation.mutate({ id, values: submitData, shouldClose: true });
    } else {
      createMutation.mutate({ values: submitData, shouldClose: true });
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-6">
        <EntitySelectField
          control={form.control}
          name="client_id"
          label={t("campaigns.client")}
          placeholder={t("campaigns.selectClient")}
          options={clients}
          isLoading={clientsLoading}
          emptyMessage={t("clients.noClientsAvailable")}
        />

        <RequiredTextField
          control={form.control}
          name="name"
          label={t("campaigns.campaignName")}
          placeholder={t("campaigns.enterCampaignName")}
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
            type="button" 
            variant="secondary"
            onClick={form.handleSubmit(handleSave)}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? t("common.saving")
              : t("common.save")
            }
          </Button>
          <Button 
            type="button" 
            onClick={form.handleSubmit(handleSaveAndClose)}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? t("common.saving")
              : t("common.saveAndClose")
            }
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CampaignForm;
