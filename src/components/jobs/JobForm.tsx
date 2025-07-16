import React from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { BaseEntityFormProps } from "@/components/common/EntityModal";
import { useJobFormLogic } from "@/hooks/useJobFormLogic";
import { useJobFormData } from "@/hooks/job-form/useJobFormData";
import { useCompaniesData } from "@/hooks/useCompaniesData";
import { useClientsData } from "@/hooks/useClientsData";
import { useCampaignsData } from "@/hooks/useCampaignsData";
import { useManagersData } from "@/hooks/useManagersData";
import { useProvidersData } from "@/hooks/useProvidersData";
import { useJobTypesData } from "@/hooks/useJobTypesData";
import { JobFormFields } from "./JobFormFields";
import JobLineItemsField from "./JobLineItemsField";

const JobForm: React.FC<BaseEntityFormProps> = ({
  id,
  mode = "create",
  onClose,
  onSuccess,
}) => {
  // Data fetching
  const { isLoading } = useJobFormData(id, mode === "edit");

  // Form logic
  const {
    form,
    totalValue,
    handleSave,
    handleSaveAndClose,
    isSubmitting,
    t,
  } = useJobFormLogic({
    id,
    mode: mode as "create" | "edit",
    onClose,
    onSuccess,
    campaigns: [],
  });

  // Fetch data using hooks
  const { data: companies = [] } = useCompaniesData();
  const { data: clients = [] } = useClientsData();
  const { data: campaigns = [] } = useCampaignsData();
  const { data: managers = [] } = useManagersData();
  const { data: providers = [] } = useProvidersData();
  const { data: jobTypes = [] } = useJobTypesData();

  // Show loading state for edit mode
  if (mode === "edit" && isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSaveAndClose)} className="space-y-6">
        {/* Job basic fields */}
        <JobFormFields
          control={form.control}
          companies={companies}
          managers={managers}
          isEditMode={mode === "edit"}
          t={t}
        />

        {/* Line items section */}
        <JobLineItemsField
          control={form.control}
          clients={clients}
          campaigns={campaigns}
          managers={managers}
          providers={providers}
          jobTypes={jobTypes}
          totalValue={totalValue}
          t={t}
        />

        {/* Action buttons */}
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {t("common.cancel")}
          </Button>
          {mode === "edit" && (
            <Button
              type="button"
              onClick={form.handleSubmit(handleSave)}
              disabled={isSubmitting}
            >
              {t("common.save")}
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {mode === "edit" ? t("common.saveAndClose") : t("common.create")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default JobForm;