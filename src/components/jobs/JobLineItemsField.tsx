
import React from "react";
import { Control, useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { JobFormValues } from "@/hooks/useJobFormLogic";
import JobLineItem from "./JobLineItem";
import { EntitySelectOption } from "@/utils/formConstants";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface JobLineItemsFieldProps {
  control: Control<JobFormValues>;
  clients: EntitySelectOption[];
  campaigns: { id: string; name: string; client_id: string }[];
  companies: EntitySelectOption[];
  jobTypes: { id: string; name: string }[];
  totalValue: number;
  t: (key: string) => string;
}

const JobLineItemsField: React.FC<JobLineItemsFieldProps> = ({
  control,
  clients,
  campaigns,
  companies,
  jobTypes,
  totalValue,
  t,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "line_items",
  });

  const addLineItem = () => {
    append({
      year: new Date().getFullYear(),
      month: "",
      company_id: "",
      client_id: "",
      campaign_id: "",
      job_type_id: "",
      value: 0,
    });
  };

  return (
    <FormField
      control={control}
      name="line_items"
      render={() => (
        <FormItem>
          <FormLabel className="text-lg font-semibold">{t("jobs.lineItems")}</FormLabel>
          
          <div className="space-y-4">
            {fields.map((field, index) => (
              <JobLineItem
                key={field.id}
                index={index}
                control={control}
                clients={clients}
                campaigns={campaigns}
                companies={companies}
                jobTypes={jobTypes}
                onRemove={() => remove(index)}
                canRemove={fields.length > 1}
                t={t}
              />
            ))}
            
            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                onClick={addLineItem}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {t("jobs.addLineItem")}
              </Button>
              
              <div className="text-lg font-semibold">
                {t("jobs.totalValue")}: €{totalValue.toFixed(2)}
              </div>
            </div>
          </div>
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default JobLineItemsField;
