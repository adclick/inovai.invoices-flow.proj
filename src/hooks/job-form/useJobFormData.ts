
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
            })) || [];
            
            reset({
              line_items: lineItems,
              company_id: jobData.company_id || "",
              provider_id: jobData.provider_id || "",
              manager_id: jobData.manager_id || "",
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
  }, [isEditMode, id, reset]);
};
