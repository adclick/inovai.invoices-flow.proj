import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useEntityMutation } from "@/hooks/useEntityMutation";
import { useEntityQuery } from "@/hooks/useEntityQuery";
import { supabase } from "@/integrations/supabase/client";
import { JOB_FORM_DEFAULTS } from "@/utils/formConstants";
import { Database } from "@/integrations/supabase/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Job = Database["public"]["Tables"]["jobs"]["Row"];

// Updated form schema for multi-select and company
const jobSchema = z.object({
  client_ids: z.array(z.string()).min(1, "jobs.selectClients"),
  campaign_ids: z.array(z.string()).min(1, "jobs.selectCampaigns"),
  provider_id: z.string().min(1, "jobs.selectProvider"),
  manager_id: z.string().min(1, "jobs.selectManager"),
  company_id: z.string().optional(),
  job_type_id: z.string().min(1, "jobs.selectJobType"),
  value: z.coerce.number().min(0, "jobs.valueRequired"),
  status: z.enum(["draft", "active", "pending_invoice", "pending_validation", "pending_payment", "paid"] as const),
  year: z.coerce.number().min(1900, "jobs.yearRequired").max(2100, "jobs.yearMax"),
  month: z.string().min(1, "jobs.monthRequired"),
  due_date: z.string().optional(),
  provider_message: z.string().optional(),
  public_notes: z.string().optional(),
  private_notes: z.string().optional(),
  invoice_reference: z.string().optional(),
  documents: z.array(z.string()).optional(),
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
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);

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
          // Fetch job data
          const { data: jobData } = await supabase
            .from("jobs")
            .select("*")
            .eq("id", id)
            .single();
          
          if (jobData) {
            // Fetch associated campaigns from junction table
            const { data: jobCampaigns } = await supabase
              .from("job_campaigns")
              .select("campaign_id, campaigns(id, name, client_id)")
              .eq("job_id", id);
            
            const campaignIds = jobCampaigns?.map(jc => jc.campaign_id) || [];
            const clientIds = [...new Set(jobCampaigns?.map((jc: any) => jc.campaigns?.client_id).filter(Boolean))];
            
            setSelectedClientIds(clientIds);
            
            form.reset({
              client_ids: clientIds,
              campaign_ids: campaignIds,
              provider_id: jobData.provider_id,
              manager_id: jobData.manager_id,
              company_id: jobData.company_id || "",
              job_type_id: jobData.job_type_id,
              value: jobData.value,
              status: jobData.status,
              year: jobData.year || new Date().getFullYear(),
              month: jobData.month ? jobData.month.toString() : "",
              due_date: jobData.due_date || "",
              public_notes: jobData.public_notes || "",
              private_notes: jobData.private_notes || "",
              invoice_reference: jobData.invoice_reference || "",
              documents: jobData.documents || [],
            });
          }
        } catch (error) {
          console.error("Error loading job:", error);
        }
      };
      loadJob();
    }
  }, [isEditMode, id, form]);

  // Mutations
  const { createMutation, updateMutation } = useEntityMutation({
    tableName: "jobs",
    entityName: "jobs",
    queryKey: "jobs",
    onSuccess,
    onClose,
  });

  // Separate mutation for job-campaign relationships
  const createJobCampaignsMutation = useMutation({
    mutationFn: async ({ jobId, campaignIds }: { jobId: string; campaignIds: string[] }) => {
      const jobCampaignInserts = campaignIds.map(campaignId => ({
        job_id: jobId,
        campaign_id: campaignId,
      }));
      
      const { error } = await supabase
        .from("job_campaigns")
        .insert(jobCampaignInserts);

      if (error) {
        console.error("Error creating job-campaign relationships:", error);
        throw error;
      }
    }
  });

  // Filter campaigns by selected clients
  const filteredCampaigns = useMemo(() => {
    if (selectedClientIds.length === 0) return [];
    return campaigns.filter(campaign => selectedClientIds.includes(campaign.client_id));
  }, [campaigns, selectedClientIds]);

  const handleClientChange = (clientIds: string[]) => {
    setSelectedClientIds(clientIds);
    // Clear campaign selection when clients change
    const currentCampaignIds = form.getValues("campaign_ids");
    const validCampaignIds = currentCampaignIds.filter(campaignId => 
      campaigns.find(c => c.id === campaignId && clientIds.includes(c.client_id))
    );
    form.setValue("campaign_ids", validCampaignIds);
  };

  // Form submission handler
  const onSubmit = async (values: JobFormValues) => {
    const submitData = {
      campaign_id: values.campaign_ids[0] || null, // Keep first campaign for backward compatibility
      provider_id: values.provider_id,
      manager_id: values.manager_id,
      company_id: values.company_id || null,
      job_type_id: values.job_type_id,
      value: values.value,
      status: values.status,
      year: values.year,
      month: parseInt(values.month),
      months: [], // Convert month number to name with proper type
      due_date: values.due_date || null,
      provider_message: values.provider_message || null,
      public_notes: values.public_notes || null,
      private_notes: values.private_notes || null,
      invoice_reference: values.invoice_reference || null,
      documents: values.documents || [],
    };

    if (isEditMode && id) {
      // Update job
      updateMutation.mutate({ 
        id, 
        values: submitData 
      });
      
      // Update junction table
      try {
        // Delete existing relationships
        await supabase
          .from("job_campaigns")
          .delete()
          .eq("job_id", id);
        
        // Insert new relationships
        const jobCampaignInserts = values.campaign_ids.map(campaignId => ({
          job_id: id,
          campaign_id: campaignId,
        }));
        
        await supabase
          .from("job_campaigns")
          .insert(jobCampaignInserts);
      } catch (error) {
        console.error("Error updating job-campaign relationships:", error);
      }
    } else {
      try {
        // Create job
        const { data: newJob, error } = await supabase
          .from("jobs")
          .insert(submitData)
          .select()
          .single();

        if (error) {
          console.error("Error creating job:", error);
          return;
        }

        if (newJob) {
          // Create job-campaign relationships
          await createJobCampaignsMutation.mutateAsync({
            jobId: newJob.id,
            campaignIds: values.campaign_ids
          });

          // Call onSuccess and onClose after successful creation
          onSuccess?.();
          onClose?.();
        }
      } catch (error) {
        console.error("Error in job creation process:", error);
      }
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending || createJobCampaignsMutation.isPending || jobLoading;

  return {
    form,
    selectedClientIds,
    filteredCampaigns,
    handleClientChange,
    onSubmit,
    isSubmitting,
    t,
  };
};
