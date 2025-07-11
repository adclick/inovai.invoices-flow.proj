
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { jobSchema, JobFormValues, UseJobFormLogicProps } from "./job-form/types";
import { getJobFormDefaults } from "./job-form/useJobFormDefaults";
import { useJobFormCalculations } from "./job-form/useJobFormCalculations";
import { useJobFormData } from "./job-form/useJobFormData";
import { useJobFormSubmit } from "./job-form/useJobFormSubmit";

export const useJobFormLogic = ({ id, mode, onClose, onSuccess, campaigns }: UseJobFormLogicProps) => {
  const { t } = useTranslation();
  const isEditMode = mode === "edit";

  // Setup form with default values
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: getJobFormDefaults(),
  });

  // Use calculations hook
  const { totalValue, hasLineItems } = useJobFormCalculations(form.watch);

  // Load job data into form when fetched - this handles both data fetching and form reset
  const { isLoading: jobDataLoading } = useJobFormData(id, isEditMode, form.reset);

  // Form submission handler
  const { onSubmit, isSubmitting } = useJobFormSubmit(id, isEditMode, onClose, onSuccess);

  const handleSave = (values: JobFormValues) => {
    onSubmit(values, false); // Don't close modal
  };

  const handleSaveAndClose = (values: JobFormValues) => {
    onSubmit(values, true); // Close modal
  };

  const finalIsSubmitting = isSubmitting || jobDataLoading;

  return {
    form,
    totalValue,
    hasLineItems,
    handleSave,
    handleSaveAndClose,
    isSubmitting: finalIsSubmitting,
    t,
  };
};

// Export types for backward compatibility
export type { JobFormValues, LineItemFormValues } from "./job-form/types";
