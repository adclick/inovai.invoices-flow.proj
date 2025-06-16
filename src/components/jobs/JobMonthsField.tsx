
import React from "react";
import { Control } from "react-hook-form";
import { JobFormValues } from "@/hooks/useJobFormLogic";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { MONTH_OPTIONS } from "@/utils/formConstants";

interface JobMonthsFieldProps {
  control: Control<JobFormValues>;
  t: (key: string) => string;
}

const JobMonthsField: React.FC<JobMonthsFieldProps> = ({ control, t }) => {
  return (
    <FormField
      control={control}
      name="line_items" // Changed from "month" to "line_items" since this component is no longer used
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("jobs.months")}</FormLabel>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {MONTH_OPTIONS.map((month) => (
              <FormItem key={month.value} className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value?.includes(month.value)}
                    onCheckedChange={(checked) => {
                      const currentValue = field.value || [];
                      if (checked) {
                        field.onChange([...currentValue, month.value]);
                      } else {
                        field.onChange(currentValue.filter((value: string) => value !== month.value));
                      }
                    }}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal">
                  {t(month.label)}
                </FormLabel>
              </FormItem>
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default JobMonthsField;
