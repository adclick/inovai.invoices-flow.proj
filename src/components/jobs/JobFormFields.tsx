import React from "react";
import { Control } from "react-hook-form";
import { JobFormValues } from "@/hooks/useJobFormLogic";
import { JobStatusBadge } from "./JobStatusBadge";
import EntitySelectField from "@/components/common/form/EntitySelectField";
import DocumentsField from "@/components/common/form/DocumentsField";
import { Checkbox } from "@/components/ui/checkbox";
import { EntitySelectOption } from "@/utils/formConstants";

interface JobFormFieldsProps {
  control: Control<JobFormValues>;
  companies: EntitySelectOption[];
  managers: EntitySelectOption[];
  currentStatus?: "active" | "closed";
  isEditMode?: boolean;
  t: (key: string) => string;
}

export const JobFormFields: React.FC<JobFormFieldsProps> = ({
  control,
  companies,
  managers,
  currentStatus,
  isEditMode,
  t,
}) => {
  return (
    <div className="space-y-6">
      {/* Show job status as read-only badge in edit mode */}
      {isEditMode && currentStatus && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{t("jobs.status.label")}:</span>
          <JobStatusBadge status={currentStatus} />
        </div>
      )}

      {/* Company field - required */}
      <EntitySelectField
        control={control}
        name="company_id"
        label={t("jobs.company")}
        placeholder={t("jobs.selectCompany")}
        options={companies}
      />

      {/* Manager field - required */}
      <EntitySelectField
        control={control}
        name="manager_id"
        label={t("jobs.manager")}
        placeholder={t("jobs.selectManager")}
        options={managers}
      />

      {/* Unique invoice checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="unique_invoice"
          {...(control as any).register("unique_invoice")}
        />
        <label htmlFor="unique_invoice" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {t("jobs.uniqueInvoiceDescription")}
        </label>
      </div>

      {/* Documents field */}
      <DocumentsField
        control={control}
        name="documents"
        label={t("jobs.documents")}
        placeholder={t("jobs.documentsPlaceholder")}
      />
    </div>
  );
};