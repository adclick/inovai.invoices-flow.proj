import React from "react";
import { Control } from "react-hook-form";
import { JobFormValues } from "@/hooks/useJobFormLogic";
import { JobStatusBadge } from "./JobStatusBadge";
import EntitySelectField from "@/components/common/form/EntitySelectField";
import DocumentsField from "@/components/common/form/DocumentsField";
import { Checkbox } from "@/components/ui/checkbox";
import { EntitySelectOption } from "@/utils/formConstants";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

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

      {/* Job Name field - required */}
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              {t("jobs.name")}
              <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder={t("jobs.enterJobName")}
                className="border-2 border-slate-200 dark:border-slate-600 focus:border-primary dark:focus:border-sidebar-accent focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                {...field}
              />
            </FormControl>
            <FormMessage className="text-red-600 dark:text-red-400 text-xs font-medium" />
          </FormItem>
        )}
      />

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