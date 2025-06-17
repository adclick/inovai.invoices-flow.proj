
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
            // Fetch associated line items with all the necessary data
            const { data: jobLineItems } = await supabase
              .from("job_line_items")
              .select(`
                *,
                campaigns(id, name, client_id)
              `)
              .eq("job_id", id);
            
            // Convert line items to form format
            const lineItems = jobLineItems?.map((item: any) => ({
              year: item.year.toString(),
              month: item.month.toString(),
              company_id: item.company_id || "",
              client_id: item.campaigns?.client_id || "",
              campaign_id: item.campaign_id,
              job_type_id: item.job_type_id || "",
              value: item.value || 0,
            })) || [{
              year: jobData.year || new Date().getFullYear(),
              month: jobData.month ? jobData.month.toString() : "",
              company_id: jobData.company_id || "",
              client_id: "",
              campaign_id: jobData.campaign_id,
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

  // Separate mutation for job line items
  const createJobLineItemsMutation = useMutation({
    mutationFn: async ({ jobId, lineItems }: { jobId: string; lineItems: LineItemFormValues[] }) => {
      const jobLineItemInserts = lineItems.map(item => ({
        job_id: jobId,
        campaign_id: item.campaign_id,
        company_id: item.company_id,
        job_type_id: item.job_type_id,
        year: item.year,
        month: parseInt(item.month),
        value: item.value,
      }));
      
      const { error } = await supabase
        .from("job_line_items")
        .insert(jobLineItemInserts);

      if (error) {
        console.error("Error creating job line items:", error);
        throw error;
      }
    }
  });

  // Form submission handler
  const onSubmit = async (values: JobFormValues) => {
    const totalValue = values.line_items.reduce((sum, item) => sum + item.value, 0);
    
    // Use the first line item for backward compatibility with main jobs table
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
      
      // Update line items
      try {
        // Delete existing line items
        await supabase
          .from("job_line_items")
          .delete()
          .eq("job_id", id);
        
        // Insert new line items
        const jobLineItemInserts = values.line_items.map(item => ({
          job_id: id,
          campaign_id: item.campaign_id,
          company_id: item.company_id,
          job_type_id: item.job_type_id,
          year: item.year,
          month: parseInt(item.month),
          value: item.value,
        }));
        
        await supabase
          .from("job_line_items")
          .insert(jobLineItemInserts);
      } catch (error) {
        console.error("Error updating job line items:", error);
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
          // Create job line items
          await createJobLineItemsMutation.mutateAsync({
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

  const isSubmitting = createMutation.isPending || updateMutation.isPending || createJobLineItemsMutation.isPending || jobLoading;

  return {
    form,
    totalValue,
    onSubmit,
    isSubmitting,
    t,
  };
};
