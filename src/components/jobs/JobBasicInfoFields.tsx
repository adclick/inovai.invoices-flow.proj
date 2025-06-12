
import React from "react";
import { Control } from "react-hook-form";
import { JobFormValues } from "@/hooks/useJobFormLogic";
import RequiredTextField from "@/components/common/form/RequiredTextField";
import OptionalSelectField from "@/components/common/form/OptionalSelectField";
import DateField from "@/components/common/form/DateField";
import { SelectOption, NUMERIC_MONTH_OPTIONS } from "@/utils/formConstants";

interface JobBasicInfoFieldsProps {
  control: Control<JobFormValues>;
  statusOptions: SelectOption[];
  jobTypes: { id: string; name: string }[];
  t: (key: string) => string;
}

const JobBasicInfoFields: React.FC<JobBasicInfoFieldsProps> = ({
  control,
  statusOptions,
  jobTypes,
  t,
}) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <OptionalSelectField
        control={control}
        name="job_type_id"
        label={t("jobs.jobType")}
        placeholder={t("jobs.selectJobType")}
        options={jobTypes.map(type => ({ value: type.id, label: type.name }))}
        t={t}
      />
			
			<OptionalSelectField
        control={control}
        name="status"
        label={t("jobs.status")}
        placeholder={t("jobs.selectStatus")}
        options={statusOptions}
        t={t}
      />

      <RequiredTextField
        control={control}
        name="value"
        label={t("jobs.value")}
        placeholder={t("jobs.value")}
        type="number"
        min="0"
        step="0.01"
      />

      <div className="grid grid-cols-2 gap-4">
        <RequiredTextField
          control={control}
          name="year"
          label={t("jobs.year")}
          placeholder={t("jobs.yearPlaceholder")}
          type="number"
          min="1900"
          max="2100"
        />

        <OptionalSelectField
          control={control}
          name="month"
          label={t("jobs.month")}
          placeholder={t("jobs.selectMonth")}
          options={NUMERIC_MONTH_OPTIONS}
          t={t}
        />
      </div>
    </div>
  );
};

export default JobBasicInfoFields;
