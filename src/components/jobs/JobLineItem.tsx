import React, { useState, useMemo } from "react";
import { Control, useFormContext } from "react-hook-form";
import { JobFormValues } from "@/hooks/useJobFormLogic";
import { EntitySelectOption, LINE_ITEM_STATUS_OPTIONS, NUMERIC_MONTH_OPTIONS } from "@/utils/formConstants";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronDown, ChevronRight } from "lucide-react";
import OptionalSelectField from "@/components/common/form/OptionalSelectField";
import EntitySelectField from "@/components/common/form/EntitySelectField";
import OptionalEntitySelectField from "@/components/common/form/OptionalEntitySelectField";
import RequiredTextField from "@/components/common/form/RequiredTextField";
import TextAreaField from "@/components/common/form/TextAreaField";
import DocumentsField from "@/components/common/form/DocumentsField";
import OptionalDateField from "@/components/common/form/OptionalDateField";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface JobLineItemProps {
  index: number;
  control: Control<JobFormValues>;
  clients: EntitySelectOption[];
  campaigns: { id: string; name: string; client_id: string }[];
  managers: EntitySelectOption[];
  providers: EntitySelectOption[];
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
  managers,
  providers,
  jobTypes,
  onRemove,
  canRemove,
  t,
}) => {
  const { watch } = useFormContext<JobFormValues>();
  const selectedClientId = watch(`line_items.${index}.client_id`);
  const [isExpanded, setIsExpanded] = useState(false);

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
    <Card className="border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium text-gray-700">
            {t("jobs.lineItem")} {index + 1}
          </h4>
          <div className="flex items-center gap-2">
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-gray-600 hover:text-gray-700"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  {t("jobs.additionalDetails")}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
            {canRemove && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRemove}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Core Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-4 mb-4">
          {/* Year Field */}
          <OptionalSelectField
            control={control}
            name={`line_items.${index}.year` as const}
            label={t("jobs.year")}
            placeholder={t("jobs.selectYear")}
            options={yearOptions}
            t={t}
          />

          {/* Month Field */}
          <OptionalSelectField
            control={control}
            name={`line_items.${index}.month` as const}
            label={t("jobs.month")}
            placeholder={t("jobs.selectMonth")}
            options={NUMERIC_MONTH_OPTIONS}
            t={t}
          />

          {/* Client Field */}
          <EntitySelectField
            control={control}
            name={`line_items.${index}.client_id` as const}
            label={t("jobs.client")}
            placeholder={t("jobs.selectClient")}
            options={clients}
            emptyMessage={t("clients.noClientsAvailable")}
          />

          {/* Campaign Field */}
          <EntitySelectField
            control={control}
            name={`line_items.${index}.campaign_id` as const}
            label={t("jobs.campaign")}
            placeholder={t("jobs.selectCampaign")}
            options={filteredCampaigns.map(c => ({ id: c.id, name: c.name }))}
            disabled={!selectedClientId}
            emptyMessage={selectedClientId ? t("campaigns.noCampaignsForClient") : t("campaigns.selectClientFirst")}
          />

          {/* Job Type Field */}
          <EntitySelectField
            control={control}
            name={`line_items.${index}.job_type_id` as const}
            label={t("jobs.jobType")}
            placeholder={t("jobs.selectJobType")}
            options={jobTypes.map(jt => ({ id: jt.id, name: jt.name }))}
            emptyMessage={t("jobs.noJobTypesAvailable")}
          />

          {/* Value Field */}
          <RequiredTextField
            control={control}
            name={`line_items.${index}.value` as const}
            label={t("jobs.value")}
            placeholder="0.00"
            type="number"
            step="0.01"
          />

					<EntitySelectField
						control={control}
						name={`line_items.${index}.status` as const}
						label={t("jobs.status")}
						placeholder={t("jobs.selectStatus")}
						options={LINE_ITEM_STATUS_OPTIONS.map(status => ({ id: status.value, name: status.label }))}
					/>

					{/* Manager Field */}
					<OptionalEntitySelectField
                  control={control}
                  name={`line_items.${index}.manager_id` as const}
                  label={t("jobs.manager")}
                  placeholder={t("jobs.selectManager")}
                  options={managers}
                />

                {/* Provider Field */}
                <OptionalEntitySelectField
                  control={control}
                  name={`line_items.${index}.provider_id` as const}
                  label={t("jobs.provider")}
                  placeholder={t("jobs.selectProvider")}
                  options={providers}
                />

                {/* Payment Date Field */}
                <OptionalDateField
                  control={control}
                  name={`line_items.${index}.payment_date` as const}
                  label={t("jobs.paymentDate")}
                  placeholder={t("jobs.selectPaymentDate")}
                />
        </div>

        {/* Additional Fields - Collapsible */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-4">
            <div className="border-t pt-4">
              <h5 className="text-sm font-medium text-gray-600 mb-3">{t("jobs.additionalDetails")}</h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Documents Field */}
                <DocumentsField
                  control={control}
                  name={`line_items.${index}.documents` as const}
                  label={t("jobs.documents")}
                  placeholder={t("jobs.documentsPlaceholder")}
                  helpText={t("jobs.documentsHelp")}
                />

                {/* Private Notes Field */}
                <TextAreaField
                  control={control}
                  name={`line_items.${index}.private_notes` as const}
                  label={t("jobs.privateNotes")}
                  placeholder={t("jobs.privateNotesPlaceholder")}
                  rows={3}
                />

                {/* Public Notes Field */}
                <TextAreaField
                  control={control}
                  name={`line_items.${index}.public_notes` as const}
                  label={t("jobs.publicNotes")}
                  placeholder={t("jobs.publicNotesPlaceholder")}
                  rows={3}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default JobLineItem;