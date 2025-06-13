import React from "react";
import { Control } from "react-hook-form";
import { JobFormValues } from "@/hooks/useJobFormLogic";
import EntitySelectField from "@/components/common/form/EntitySelectField";
import MultiSelectField from "@/components/common/form/MultiSelectField";
import { EntitySelectOption } from "@/utils/formConstants";
import OptionalSelectField from "../common/form/OptionalSelectField";

interface JobEntitySelectionFieldsProps {
	control: Control<JobFormValues>;
	clients: EntitySelectOption[];
	filteredCampaigns: { id: string; name: string; client_id: string }[];
	providers: EntitySelectOption[];
	managers: EntitySelectOption[];
	companies: EntitySelectOption[];
	jobTypes: { id: string; name: string }[];
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
	jobTypes,
	selectedClientIds,
	onClientChange,
	t,
}) => {
	return (
		<div className="grid grid-cols-1 gap-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<EntitySelectField
					control={control}
					name="company_id"
					label={t("companies.title")}
					placeholder={t("companies.selectCompany")}
					options={companies}
					emptyMessage={t("companies.noCompaniesAvailable")}
				/>

				<OptionalSelectField
					control={control}
					name="job_type_id"
					label={t("jobs.jobType")}
					placeholder={t("jobs.selectJobType")}
					options={jobTypes.map(type => ({ value: type.id, label: type.name }))}
					t={t}
				/>
			</div>

			{/* Clients and Campaigns in a single row */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<MultiSelectField
					control={control}
					name="client_ids"
					label={t("clients.title")}
					placeholder={t("jobs.selectClients")}
					options={clients}
					emptyMessage={t("clients.noClientsAvailable")}
				/>

				<MultiSelectField
					control={control}
					name="campaign_ids"
					label={t("campaigns.title")}
					placeholder={selectedClientIds.length > 0 ? t("jobs.selectCampaigns") : t("campaigns.selectClientFirst")}
					options={filteredCampaigns.map(campaign => ({ id: campaign.id, name: campaign.name }))}
					disabled={selectedClientIds.length === 0}
					emptyMessage={selectedClientIds.length > 0 ? t("campaigns.noCampaignsForClient") : t("campaigns.selectClientFirst")}
				/>
			</div>

			{/* Provider and Manager in a single row */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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


		</div>
	);
};

export default JobEntitySelectionFields;
