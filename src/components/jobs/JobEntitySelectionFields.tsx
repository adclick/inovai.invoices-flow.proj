
import React from "react";
import { Control } from "react-hook-form";
import { JobFormValues } from "@/hooks/useJobFormLogic";
import EntitySelectField from "@/components/common/form/EntitySelectField";
import MultiSelectField from "@/components/common/form/MultiSelectField";
import { EntitySelectOption } from "@/utils/formConstants";

interface JobEntitySelectionFieldsProps {
  control: Control<JobFormValues>;
  clients: EntitySelectOption[];
  filteredCampaigns: { id: string; name: string; client_id: string }[];
  providers: EntitySelectOption[];
  managers: EntitySelectOption[];
  companies: EntitySelectOption[];
  selectedClientIds: string[];
  onClientChange: (clientIds: string[]) => void;
  t: (key: string) => string;
}

const JobEntitySelectionFields: React.FC<JobEntitySelectionFieldsProps> = ({
  control,
  clients,
  filteredCampaigns,
  providers,
  managers,
  companies,
  selectedClientIds,
  onClientChange,
  t,
}) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Multi-select for Clients */}
      <MultiSelectField
        control={control}
        name="client_ids"
        label={t("clients.title")}
        placeholder={t("jobs.selectClients")}
        options={clients}
        emptyMessage={t("clients.noClientsAvailable")}
      />

      {/* Multi-select for Campaigns - enabled only when clients are selected */}
      <MultiSelectField
        control={control}
        name="campaign_ids"
        label={t("campaigns.title")}
        placeholder={selectedClientIds.length > 0 ? t("jobs.selectCampaigns") : t("campaigns.selectClientFirst")}
        options={filteredCampaigns.map(campaign => ({ id: campaign.id, name: campaign.name }))}
        disabled={selectedClientIds.length === 0}
        emptyMessage={selectedClientIds.length > 0 ? t("campaigns.noCampaignsForClient") : t("campaigns.selectClientFirst")}
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

      <EntitySelectField
        control={control}
        name="company_id"
        label={t("companies.title")}
        placeholder={t("companies.selectCompany")}
        options={companies}
        emptyMessage={t("companies.noCompaniesAvailable")}
      />
    </div>
  );
};

export default JobEntitySelectionFields;
