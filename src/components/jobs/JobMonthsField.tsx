
import React from "react";
import { Control } from "react-hook-form";
import { JobFormValues } from "@/hooks/useJobFormLogic";
import OptionalSelectField from "@/components/common/form/OptionalSelectField";
import { NUMERIC_MONTH_OPTIONS } from "@/utils/formConstants";

interface JobMonthsFieldProps {
  control: Control<JobFormValues>;
  t: (key: string) => string;
}

const JobMonthsField: React.FC<JobMonthsFieldProps> = ({
  control,
  t,
}) => {
  return (
    <OptionalSelectField
      control={control}
      name="month"
      label={t("jobs.month")}
      placeholder={t("jobs.selectMonth")}
      options={NUMERIC_MONTH_OPTIONS}
      t={t}
    />
  );
};

export default JobMonthsField;
