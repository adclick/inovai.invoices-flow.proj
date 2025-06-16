
import React, { useMemo } from "react";
import { Control, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { JobFormValues, LineItemFormValues } from "@/hooks/useJobFormLogic";
import EntitySelectField from "@/components/common/form/EntitySelectField";
import OptionalSelectField from "@/components/common/form/OptionalSelectField";
import RequiredTextField from "@/components/common/form/RequiredTextField";
import { EntitySelectOption, NUMERIC_MONTH_OPTIONS } from "@/utils/formConstants";

interface JobLineItemProps {
  index: number;
  control: Control<JobFormValues>;
  clients: EntitySelectOption[];
  campaigns: { id: string; name: string; client_id: string }[];
  companies: EntitySelectOption[];
  jobTypes: { id: string; name: string }[];
  onRemove: () => void;
  canRemove: boolean;
  t: (key: string) => string;
}

const JobLineItem: React.FC<JobLineItemProps> = ({
  index,
  control,
  clients,
  campaigns,
  companies,
  jobTypes,
  onRemove,
  canRemove,
  t,
}) => {
  const { watch } = useFormContext<JobFormValues>();
  const selectedClientId = watch(`line_items.${index}.client_id`);

  // Filter campaigns by selected client
  const filteredCampaigns = useMemo(() => {
    if (!selectedClientId) return [];
    return campaigns.filter(campaign => campaign.client_id === selectedClientId);
  }, [campaigns, selectedClientId]);

  // Generate year options (current year ± 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => {
    const year = currentYear - 5 + i;
    return { value: year.toString(), label: year.toString() };
  });

  return (
    <Card className="relative">
      <CardContent className="p-4">
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="absolute top-2 right-2 h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <OptionalSelectField
              control={control}
              name={`line_items.${index}.year` as any}
              label={t("jobs.year")}
              placeholder={t("jobs.selectYear")}
              options={yearOptions}
              t={t}
            />
            
            <OptionalSelectField
              control={control}
              name={`line_items.${index}.month` as any}
              label={t("jobs.month")}
              placeholder={t("jobs.selectMonth")}
              options={NUMERIC_MONTH_OPTIONS}
              t={t}
            />
            
            <EntitySelectField
              control={control}
              name={`line_items.${index}.company_id` as any}
              label={t("companies.title")}
              placeholder={t("companies.selectCompany")}
              options={companies}
              emptyMessage={t("companies.noCompaniesAvailable")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EntitySelectField
              control={control}
              name={`line_items.${index}.client_id` as any}
              label={t("clients.title")}
              placeholder={t("jobs.selectClient")}
              options={clients}
              emptyMessage={t("clients.noClientsAvailable")}
            />
            
            <EntitySelectField
              control={control}
              name={`line_items.${index}.campaign_id` as any}
              label={t("campaigns.title")}
              placeholder={selectedClientId ? t("jobs.selectCampaign") : t("campaigns.selectClientFirst")}
              options={filteredCampaigns.map(c => ({ id: c.id, name: c.name }))}
              disabled={!selectedClientId}
              emptyMessage={selectedClientId ? t("campaigns.noCampaignsForClient") : t("campaigns.selectClientFirst")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EntitySelectField
              control={control}
              name={`line_items.${index}.job_type_id` as any}
              label={t("jobs.jobType")}
              placeholder={t("jobs.selectJobType")}
              options={jobTypes.map(type => ({ id: type.id, name: type.name }))}
              emptyMessage={t("jobs.noJobTypesAvailable")}
            />
            
            <RequiredTextField
              control={control}
              name={`line_items.${index}.value` as any}
              label={t("jobs.value")}
              placeholder="0.00"
              type="number"
              step="0.01"
              min="0"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobLineItem;
