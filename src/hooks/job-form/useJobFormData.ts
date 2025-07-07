
import React from "react";
import { UseFormReset } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { JobFormValues } from "./types";

export const useJobFormData = (
  id?: string,
  isEditMode?: boolean,
  reset?: UseFormReset<JobFormValues>
) => {
  // Load job data into form when fetched
  React.useEffect(() => {
    if (isEditMode && id && reset) {
      const loadJob = async () => {
        try {
          // Fetch job data
          const { data: jobData, error: jobError } = await supabase
            .from("jobs")
            .select("*")
            .eq("id", id)
            .maybeSingle();
          
          if (jobError) {
            console.error("Error loading job:", jobError);
            return;
          }
          
          if (jobData && typeof jobData === 'object' && jobData !== null && 'id' in jobData) {
            const job = jobData as any;
            
            // Fetch associated line items with all the necessary data
            const { data: jobLineItems, error: lineItemsError } = await supabase
              .from("job_line_items")
              .select(`
                *,
                campaigns(id, name, client_id)
              `)
              .eq("job_id", id);
            
            if (lineItemsError) {
              console.error("Error loading line items:", lineItemsError);
            }
            
            // Convert line items to form format
            const lineItems = jobLineItems?.map((item: any) => ({
              year: item.year?.toString() || "",
              month: item.month?.toString() || "",
              company_id: item.company_id || "",
              client_id: item.campaigns?.client_id || "",
              campaign_id: item.campaign_id || "",
              job_type_id: item.job_type_id || "",
              value: item.value || 0,
            })) || [];
            
            reset({
              line_items: lineItems,
              company_id: job.company_id || "",
              provider_id: job.provider_id || "",
              manager_id: job.manager_id || "",
              status: job.status || "draft",
              due_date: job.due_date || "",
              payment_date: job.payment_date || "",
              public_notes: job.public_notes || "",
              private_notes: job.private_notes || "",
              invoice_reference: job.invoice_reference || "",
              documents: job.documents || [],
            });
          }
        } catch (error) {
          console.error("Error loading job:", error);
        }
      };
      loadJob();
    }
  }, [isEditMode, id, reset]);
};
