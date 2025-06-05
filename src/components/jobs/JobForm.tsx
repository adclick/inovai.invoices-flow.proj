
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BaseEntityFormProps } from "../common/EntityModal";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useJobFormData } from "@/hooks/useJobFormData";
import { useJobFormLogic } from "@/hooks/useJobFormLogic";
import JobBasicInfoFields from "./JobBasicInfoFields";
import JobEntitySelectionFields from "./JobEntitySelectionFields";
import JobMonthsField from "./JobMonthsField";
import JobNotesFields from "./JobNotesFields";

const JobForm: React.FC<BaseEntityFormProps> = ({
  id,
  mode,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation();
  
  // Only allow create and edit modes for this form
  const formMode = mode === "view" ? "edit" : mode;
  
  // Fetch all required data
  const {
    clients,
    campaigns,
    providers,
    managers,
    companies,
    jobTypes,
    statusOptions,
    monthOptions,
    isLoading: dataLoading,
  } = useJobFormData();

  // Handle form logic
  const {
    form,
    selectedClientIds,
    filteredCampaigns,
    handleClientChange,
    onSubmit,
    isSubmitting,
  } = useJobFormLogic({
    id,
    mode: formMode,
    onClose,
    onSuccess,
    campaigns,
  });

  // Watch for client changes in the form
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "client_ids") {
        handleClientChange(value.client_ids || []);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, handleClientChange]);

  const isLoading = dataLoading || isSubmitting;
  const isReadOnly = mode === "view";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <JobBasicInfoFields
          control={form.control}
          statusOptions={statusOptions}
          jobTypes={jobTypes}
          t={t}
        />

        <JobEntitySelectionFields
          control={form.control}
          clients={clients}
          filteredCampaigns={filteredCampaigns}
          providers={providers}
          managers={managers}
          companies={companies}
          selectedClientIds={selectedClientIds}
          onClientChange={handleClientChange}
          t={t}
        />

        <JobMonthsField
          control={form.control}
          monthOptions={monthOptions}
          t={t}
        />

        <JobNotesFields
          control={form.control}
          t={t}
        />

        <div className="sticky bottom-0 z-10 bg-card p-4 border-t border-border flex justify-between items-center">
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("common.back")}
          </Button>
          {!isReadOnly && (
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? formMode === "edit"
                    ? t("common.updating")
                    : t("common.creating")
                  : formMode === "edit"
                  ? t("common.save")
                  : t("common.create")}
              </Button>
            </div>
          )}
        </div>
      </form>
    </Form>
  );
};

export default JobForm;
