
import React from "react";
import { Control } from "react-hook-form";
import { JobFormValues } from "@/hooks/useJobFormLogic";
import EntitySelectField from "@/components/common/form/EntitySelectField";
import { EntitySelectOption } from "@/utils/formConstants";

interface JobEntitySelectionFieldsProps {
  control: Control<JobFormValues>;
  clients: EntitySelectOption[];
  filteredCampaigns: { id: string; name: string; client_id: string }[];
  providers: EntitySelectOption[];
  managers: EntitySelectOption[];
  selectedClientId: string;
  onClientChange: (clientId: string) => void;
  t: (key: string) => string;
}

const JobEntitySelectionFields: React.FC<JobEntitySelectionFieldsProps> = ({
  control,
  clients,
  filteredCampaigns,
  providers,
  managers,
  selectedClientId,
  onClientChange,
  t,
}) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Client Selection - Not part of form schema, just for filtering campaigns */}
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {t("jobs.client")}
        </label>
        <select
          value={selectedClientId}
          onChange={(e) => onClientChange(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">{t("jobs.selectClient")}</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      <EntitySelectField
        control={control}
        name="campaign_id"
        label={t("jobs.campaign")}
        placeholder={selectedClientId ? t("jobs.selectCampaign") : t("jobs.selectClientFirst")}
        options={filteredCampaigns.map(campaign => ({ id: campaign.id, name: campaign.name }))}
        disabled={!selectedClientId}
        emptyMessage={selectedClientId ? t("campaigns.noCampaignsForClient") : t("campaigns.selectClientFirst")}
      />

      <EntitySelectField
        control={control}
        name="provider_id"
        label={t("jobs.provider")}
        placeholder={t("jobs.selectProvider")}
        options={providers}
        emptyMessage={t("providers.noProvidersAvailable")}
      />

      <EntitySelectField
        control={control}
        name="manager_id"
        label={t("jobs.manager")}
        placeholder={t("jobs.selectManager")}
        options={managers}
        emptyMessage={t("managers.noManagersAvailable")}
      />
    </div>
  );
};

export default JobEntitySelectionFields;
