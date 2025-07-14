
import { supabase } from "@/integrations/supabase/client";
import { JobFormValues } from "./types";
import { useJobFormMutations } from "./useJobFormMutations";

export const useJobFormSubmit = (
  id?: string,
  isEditMode?: boolean,
  onClose?: () => void,
  onSuccess?: () => void
) => {
  const { createMutation, updateMutation, createJobLineItemsMutation } = useJobFormMutations(
    onSuccess,
    onClose
  );

  const onSubmit = async (values: JobFormValues, shouldClose: boolean = true) => {
    const hasLineItems = values.line_items && values.line_items.length > 0;
    const totalLineItemValue = hasLineItems 
      ? values.line_items.reduce((sum, item) => sum + (item.value || 0), 0) 
      : 0;
    
    const jobData = {
      company_id: values.company_id,
      unique_invoice: values.unique_invoice,
      value: totalLineItemValue,
      months: [], // This will be populated from line items if needed
      year: null,
      status: 'active' as const, // Jobs start as active
      currency: "euro" as const,
      documents: values.documents,
    };

    if (isEditMode && id) {
      // Update job
      updateMutation.mutate({ 
        id, 
        values: jobData,
        shouldClose 
      });
      
      // Update line items
      try {
        // Delete existing line items
        await supabase
          .from("job_line_items")
          .delete()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .eq("job_id", id as any);
        
        // Insert new line items if they exist
        if (hasLineItems) {
          const jobLineItemInserts = values.line_items.map(item => ({
            job_id: id,
            campaign_id: item.campaign_id,
            job_type_id: item.job_type_id,
            year: item.year,
            month: parseInt(item.month),
            value: item.value || null,
            manager_id: item.manager_id || null,
            provider_id: item.provider_id || null,
            payment_date: item.payment_date || null,
            status: item.status || 'in_progress',
            documents: item.documents || null,
            private_notes: item.private_notes || null,
            public_notes: item.public_notes || null,
          }));
          
          await supabase
            .from("job_line_items")
            .insert(jobLineItemInserts as any);
        }
      } catch (error) {
        console.error("Error updating job line items:", error);
      }
    } else {
      try {
        // Create job
        const { data: jobResult, error: jobError } = await supabase
          .from("jobs")
          .insert(jobData as any)
          .select('id')
          .single();

        if (jobError) {
          console.error("Error creating job:", jobError);
          return;
        }

        // Create line items (required to have at least 1)
        if (jobResult && 'id' in jobResult && values.line_items && values.line_items.length > 0) {
          const lineItemsData = values.line_items.map((item) => ({
            job_id: jobResult.id,
            campaign_id: item.campaign_id,
            job_type_id: item.job_type_id,
            year: item.year,
            month: parseInt(item.month),
            value: item.value || null,
            manager_id: item.manager_id || null,
            provider_id: item.provider_id || null,
            payment_date: item.payment_date || null,
            status: item.status || 'in_progress',
            documents: item.documents || null,
            private_notes: item.private_notes || null,
            public_notes: item.public_notes || null,
          }));

          const { error: lineItemError } = await supabase
            .from("job_line_items")
            .insert(lineItemsData as any);

          if (lineItemError) {
            console.error("Error creating line items:", lineItemError);
            return;
          }
        }

        // Call onSuccess and onClose based on shouldClose parameter
        onSuccess?.();
        if (shouldClose) {
          onClose?.();
        }
      } catch (error) {
        console.error("Error in job creation process:", error);
      }
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending || createJobLineItemsMutation.isPending;

  return {
    onSubmit,
    isSubmitting,
  };
};
