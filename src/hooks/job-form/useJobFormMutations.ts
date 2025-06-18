
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEntityMutation } from "@/hooks/useEntityMutation";
import { LineItemFormValues } from "./types";

export const useJobFormMutations = (
  onSuccess?: () => void,
  onClose?: () => void
) => {
  // Main job mutations
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

  return {
    createMutation,
    updateMutation,
    createJobLineItemsMutation,
  };
};
