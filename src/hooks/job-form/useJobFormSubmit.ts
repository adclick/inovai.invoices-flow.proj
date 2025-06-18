
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

  const onSubmit = async (values: JobFormValues) => {
    const hasLineItems = values.line_items && values.line_items.length > 0;
    const totalValue = hasLineItems ? values.line_items.reduce((sum, item) => sum + item.value, 0) : 0;
    
    // For backward compatibility with main jobs table
    const firstLineItem = hasLineItems ? values.line_items[0] : null;
    
    const submitData = {
      campaign_id: firstLineItem?.campaign_id || null,
      provider_id: values.provider_id || null,
      manager_id: values.manager_id || null,
      company_id: values.company_id || null,
      job_type_id: firstLineItem?.job_type_id || null,
      value: totalValue,
      status: values.status,
      year: firstLineItem?.year || null,
      month: firstLineItem ? parseInt(firstLineItem.month) : null,
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
        
        // Insert new line items if they exist
        if (hasLineItems) {
          const jobLineItemInserts = values.line_items.map(item => ({
            job_id: id,
            campaign_id: item.campaign_id,
            job_type_id: item.job_type_id,
            year: item.year,
            month: parseInt(item.month),
            value: item.value,
          }));
          
          await supabase
            .from("job_line_items")
            .insert(jobLineItemInserts);
        }
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

        if (newJob && hasLineItems) {
          // Create job line items only if they exist
          await createJobLineItemsMutation.mutateAsync({
            jobId: newJob.id,
            lineItems: values.line_items
          });
        }

        // Call onSuccess and onClose after successful creation
        onSuccess?.();
        onClose?.();
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
