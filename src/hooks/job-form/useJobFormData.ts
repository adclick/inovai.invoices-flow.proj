
import React from "react";
import { UseFormReset } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { JobFormValues } from "./types";

export const useJobFormData = (
  id?: string,
  isEditMode?: boolean,
  reset?: UseFormReset<JobFormValues>
) => {
  const [isLoading, setIsLoading] = React.useState(false);

  // Load job data into form when fetched
  React.useEffect(() => {
    if (isEditMode && id && reset) {
      const loadJob = async () => {
        setIsLoading(true);
        try {
          // Fetch job data
           
          const { data: jobData, error: jobError } = await (supabase
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .from("jobs" as any)
            .select("*")
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .eq("id", id as any)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .maybeSingle() as any);
          
          if (jobError) {
            console.error("Error loading job:", jobError);
            return;
          }
          
          if (jobData && typeof jobData === 'object' && jobData !== null && 'id' in jobData) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const job = jobData as any;
            
            // Fetch associated line items with all the necessary data
             
            const { data: jobLineItems, error: lineItemsError } = await (supabase
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .from("job_line_items" as any)
              .select(`
                *,
                campaigns(id, name, client_id)
              `)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .eq("job_id", id as any) as any);
            
            if (lineItemsError) {
              console.error("Error loading line items:", lineItemsError);
            }
            
            // Convert line items to form format
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const lineItems = jobLineItems?.map((item: any) => ({
              year: item.year || new Date().getFullYear(),
              month: item.month?.toString() || "",
              client_id: item.campaigns?.client_id || "",
              campaign_id: item.campaign_id || "",
              job_type_id: item.job_type_id || "",
              value: item.value || undefined,
              manager_id: item.manager_id || "",
              provider_id: item.provider_id || "",
              payment_date: item.payment_date || "",
              status: item.status || "in_progress",
              documents: item.documents || [],
              private_notes: item.private_notes || "",
              public_notes: item.public_notes || "",
            })) || [{
              year: new Date().getFullYear(),
              month: "",
              client_id: "",
              campaign_id: "",
              job_type_id: "",
              value: undefined,
              manager_id: "",
              provider_id: "",
              payment_date: "",
              status: "in_progress",
              documents: [],
              private_notes: "",
              public_notes: "",
            }];
            
            reset({
              name: job.name || "",
              company_id: job.company_id || "",
              manager_id: job.manager_id || "",
              unique_invoice: job.unique_invoice || false,
              documents: job.documents || [],
              line_items: lineItems,
            });
          }
        } catch (error) {
          console.error("Error loading job:", error);
        } finally {
          setIsLoading(false);
        }
      };
      loadJob();
    } else {
      setIsLoading(false);
    }
  }, [isEditMode, id, reset]);

  return { isLoading };
};
