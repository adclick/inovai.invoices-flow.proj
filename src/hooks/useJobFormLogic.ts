
import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useEntityMutation } from "@/hooks/useEntityMutation";
import { useEntityQuery } from "@/hooks/useEntityQuery";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Job = Database["public"]["Tables"]["jobs"]["Row"];

// Line item schema
const lineItemSchema = z.object({
  year: z.coerce.number().min(1900, "jobs.yearRequired").max(2100, "jobs.yearMax"),
  month: z.string().min(1, "jobs.monthRequired"),
  company_id: z.string().min(1, "jobs.selectCompany"),
  client_id: z.string().min(1, "jobs.selectClient"),
  campaign_id: z.string().min(1, "jobs.selectCampaign"),
  job_type_id: z.string().min(1, "jobs.selectJobType"),
  value: z.coerce.number().min(0, "jobs.valueRequired"),
});

// Updated form schema for line items
const jobSchema = z.object({
  line_items: z.array(lineItemSchema).min(1, "jobs.lineItemRequired"),
  provider_id: z.string().min(1, "jobs.selectProvider"),
  manager_id: z.string().min(1, "jobs.selectManager"),
  status: z.enum(["draft", "active", "pending_invoice", "pending_validation", "pending_payment", "paid"] as const),
  due_date: z.string().optional(),
  payment_date: z.string().optional(),
  provider_message: z.string().optional(),
  public_notes: z.string().optional(),
  private_notes: z.string().optional(),
  invoice_reference: z.string().optional(),
  documents: z.array(z.string()).optional(),
});

export type JobFormValues = z.infer<typeof jobSchema>;
export type LineItemFormValues = z.infer<typeof lineItemSchema>;

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

  // Setup form with default values
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      line_items: [{
        year: new Date().getFullYear(),
        month: "",
        company_id: "",
        client_id: "",
        campaign_id: "",
        job_type_id: "",
        value: 0,
      }],
      provider_id: "",
      manager_id: "",
      status: "draft",
      due_date: "",
      payment_date: "",
      provider_message: "",
      public_notes: "",
      private_notes: "",
      invoice_reference: "",
      documents: [],
    },
  });

  // Calculate total value from line items
  const totalValue = useMemo(() => {
    const lineItems = form.watch("line_items");
    return lineItems?.reduce((sum, item) => sum + (Number(item.value) || 0), 0) || 0;
  }, [form.watch("line_items")]);

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
            // Fetch associated campaigns from junction table with values
            const { data: jobCampaigns } = await supabase
              .from("job_campaigns")
              .select("campaign_id, value, campaigns(id, name, client_id)")
              .eq("job_id", id);
            
            // Convert existing data to line items format
            const lineItems = jobCampaigns?.map((jc: any) => ({
              year: jobData.year || new Date().getFullYear(),
              month: jobData.month ? jobData.month.toString() : "",
              company_id: jobData.company_id || "",
              client_id: jc.campaigns?.client_id || "",
              campaign_id: jc.campaign_id,
              job_type_id: jobData.job_type_id || "",
              value: jc.value || 0,
            })).filter(item => item.campaign_id) || [{
              year: jobData.year || new Date().getFullYear(),
              month: jobData.month ? jobData.month.toString() : "",
              company_id: jobData.company_id || "",
              client_id: "",
              campaign_id: "",
              job_type_id: jobData.job_type_id || "",
              value: jobData.value || 0,
            }];
            
            form.reset({
              line_items: lineItems,
              provider_id: jobData.provider_id,
              manager_id: jobData.manager_id,
              status: jobData.status,
              due_date: jobData.due_date || "",
              payment_date: jobData.payment_date || "",
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
    mutationFn: async ({ jobId, lineItems }: { jobId: string; lineItems: LineItemFormValues[] }) => {
      const jobCampaignInserts = lineItems.map(item => ({
        job_id: jobId,
        campaign_id: item.campaign_id,
        value: item.value,
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

  // Form submission handler
  const onSubmit = async (values: JobFormValues) => {
    const totalValue = values.line_items.reduce((sum, item) => sum + item.value, 0);
    
    // Use the first line item for backward compatibility
    const firstLineItem = values.line_items[0];
    
    const submitData = {
      campaign_id: firstLineItem.campaign_id,
      provider_id: values.provider_id,
      manager_id: values.manager_id,
      company_id: firstLineItem.company_id,
      job_type_id: firstLineItem.job_type_id,
      value: totalValue,
      status: values.status,
      year: firstLineItem.year,
      month: parseInt(firstLineItem.month),
      months: [],
      due_date: values.due_date || null,
      payment_date: values.payment_date || null,
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
        
        // Insert new relationships with values
        const jobCampaignInserts = values.line_items.map(item => ({
          job_id: id,
          campaign_id: item.campaign_id,
          value: item.value,
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
          // Create job-campaign relationships with values
          await createJobCampaignsMutation.mutateAsync({
            jobId: newJob.id,
            lineItems: values.line_items
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
    totalValue,
    onSubmit,
    isSubmitting,
    t,
  };
};
