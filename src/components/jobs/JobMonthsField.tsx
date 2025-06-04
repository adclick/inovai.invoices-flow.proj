
import React from "react";
import { Control } from "react-hook-form";
import { JobFormValues } from "@/hooks/useJobFormLogic";
import CheckboxGroupField from "@/components/common/form/CheckboxGroupField";
import { SelectOption } from "@/utils/formConstants";

interface JobMonthsFieldProps {
  control: Control<JobFormValues>;
  monthOptions: SelectOption[];
  t: (key: string) => string;
}

const JobMonthsField: React.FC<JobMonthsFieldProps> = ({
  control,
  monthOptions,
  t,
}) => {
  return (
    <CheckboxGroupField
      control={control}
      name="months"
      label={t("jobs.months")}
      description={t("jobs.selectMonthsDescription")}
      options={monthOptions}
    />
  );
};

export default JobMonthsField;
