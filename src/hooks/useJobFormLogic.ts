
import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useEntityMutation } from "@/hooks/useEntityMutation";
import { useEntityQuery } from "@/hooks/useEntityQuery";
import { supabase } from "@/integrations/supabase/client";
import { JOB_FORM_DEFAULTS } from "@/utils/formConstants";

// Form schema with proper validation using Supabase types
const jobSchema = z.object({
  campaign_id: z.string().min(1, "jobs.selectCampaign"),
  provider_id: z.string().min(1, "jobs.selectProvider"),
  manager_id: z.string().min(1, "jobs.selectManager"),
  job_type_id: z.string().min(1, "jobs.selectJobType"),
  value: z.coerce.number().min(0, "jobs.valueRequired"),
  status: z.enum(["draft", "active", "pending_invoice", "pending_validation", "pending_payment", "paid"] as const),
  months: z.array(z.enum([
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
  ] as const)).min(1, "jobs.selectMonths"),
  due_date: z.string().optional(),
  provider_message: z.string().optional(),
  public_notes: z.string().optional(),
  private_notes: z.string().optional(),
});

export type JobFormValues = z.infer<typeof jobSchema>;

interface UseJobFormLogicProps {
  id?: string;
  mode: 'create' | 'edit';
  onClose: () => void;
  onSuccess?: () => void;
  campaigns: any[];
}

export const useJobFormLogic = ({ id, mode, onClose, onSuccess, campaigns }: UseJobFormLogicProps) => {
  const { t } = useTranslation();
  const isEditMode = mode === "edit";
  const [selectedClientId, setSelectedClientId] = useState("");

  // Setup form with default values
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: JOB_FORM_DEFAULTS,
  });

  // Fetch job data if in edit mode
  const { isLoading: jobLoading } = useEntityQuery({
    tableName: "jobs",
    entityName: "job",
    id,
    enabled: isEditMode && !!id,
    select: "*",
  });

  // Load job data into form when fetched
  React.useEffect(() => {
    if (isEditMode && id) {
      const loadJob = async () => {
        try {
          const { data } = await supabase
            .from("jobs")
            .select("*")
            .eq("id", id)
            .single();
          
          if (data) {
            // Find client ID from campaign
            const campaign = campaigns.find(c => c.id === data.campaign_id);
            if (campaign) {
              setSelectedClientId(campaign.client_id);
            }
            
            form.reset({
              campaign_id: data.campaign_id,
              provider_id: data.provider_id,
              manager_id: data.manager_id,
              job_type_id: data.job_type_id,
              value: data.value,
              status: data.status,
              months: data.months || [],
              due_date: data.due_date || "",
              public_notes: data.public_notes || "",
              private_notes: data.private_notes || "",
            });
          }
        } catch (error) {
          console.error("Error loading job:", error);
        }
      };
      loadJob();
    }
  }, [isEditMode, id, form, campaigns]);

  // Mutations
  const { createMutation, updateMutation } = useEntityMutation({
    tableName: "jobs",
    entityName: "jobs",
    queryKey: "jobs",
    onSuccess,
    onClose,
  });

  // Filter campaigns by selected client
  const filteredCampaigns = useMemo(() => {
    if (!selectedClientId) return campaigns;
    return campaigns.filter(campaign => campaign.client_id === selectedClientId);
  }, [campaigns, selectedClientId]);

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    form.setValue("campaign_id", "");
  };

  // Form submission handler
  const onSubmit = (values: JobFormValues) => {
    const submitData = {
      campaign_id: values.campaign_id,
      provider_id: values.provider_id,
      manager_id: values.manager_id,
      job_type_id: values.job_type_id,
      value: values.value,
      status: values.status,
      months: values.months,
      due_date: values.due_date || null,
      provider_message: values.provider_message || null,
      public_notes: values.public_notes || null,
      private_notes: values.private_notes || null,
    };

    if (isEditMode && id) {
      updateMutation.mutate({ id, values: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending || jobLoading;

  return {
    form,
    selectedClientId,
    filteredCampaigns,
    handleClientChange,
    onSubmit,
    isSubmitting,
    t,
  };
};
