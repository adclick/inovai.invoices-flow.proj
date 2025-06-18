
import React from "react";
import { Control, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { JobFormValues } from "@/hooks/useJobFormLogic";
import JobLineItem from "./JobLineItem";
import { EntitySelectOption } from "@/utils/formConstants";

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
      client_id: "",
      campaign_id: "",
      job_type_id: "",
      value: 0,
    });
  };

  const handleRemoveLineItem = (index: number) => {
    try {
      remove(index);
    } catch (error) {
      console.error("Error removing line item:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t("jobs.lineItems")}</h3>
        <span className="text-sm text-muted-foreground">
          {t("jobs.lineItemsOptional")}
        </span>
      </div>
      
      {fields.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
          <p className="text-sm text-muted-foreground mb-4">
            {t("jobs.noLineItems")}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={addLineItem}
            className="flex items-center gap-2 mx-auto"
          >
            <Plus className="h-4 w-4" />
            {t("jobs.addFirstLineItem")}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <JobLineItem
              key={field.id}
              index={index}
              control={control}
              clients={clients}
              campaigns={campaigns}
              jobTypes={jobTypes}
              onRemove={() => handleRemoveLineItem(index)}
              canRemove={true}
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
      )}
    </div>
  );
};

export default JobLineItemsField;
