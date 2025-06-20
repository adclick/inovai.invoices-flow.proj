
import React from "react";
import { Control } from "react-hook-form";
import { JobFormValues } from "@/hooks/useJobFormLogic";
import EntitySelectField from "@/components/common/form/EntitySelectField";
import OptionalEntitySelectField from "@/components/common/form/OptionalEntitySelectField";
import JobLineItemsField from "./JobLineItemsField";
import { EntitySelectOption } from "@/utils/formConstants";

interface JobEntitySelectionFieldsProps {
	control: Control<JobFormValues>;
	clients: EntitySelectOption[];
	campaigns: { id: string; name: string; client_id: string }[];
	providers: EntitySelectOption[];
	managers: EntitySelectOption[];
	companies: EntitySelectOption[];
	jobTypes: { id: string; name: string }[];
	totalValue: number;
	t: (key: string) => string;
}

const JobEntitySelectionFields: React.FC<JobEntitySelectionFieldsProps> = ({
	control,
	clients,
	campaigns,
	providers,
	managers,
	companies,
	jobTypes,
	totalValue,
	t,
}) => {
	return (
		<div className="space-y-6">
			{/* Job Information */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<OptionalEntitySelectField
					control={control}
					name="provider_id"
					label={t("jobs.provider")}
					placeholder={t("jobs.selectProvider")}
					options={providers}
					emptyMessage={t("providers.noProvidersAvailable")}
				/>

				<OptionalEntitySelectField
					control={control}
					name="manager_id"
					label={t("jobs.manager")}
					placeholder={t("jobs.selectManager")}
					options={managers}
					emptyMessage={t("managers.noManagersAvailable")}
				/>

				<OptionalEntitySelectField
					control={control}
					name="company_id"
					label={t("companies.title")}
					placeholder={t("companies.selectCompany")}
					options={companies}
					emptyMessage={t("companies.noCompaniesAvailable")}
				/>
			</div>

			{/* Line Items */}
			<JobLineItemsField
				control={control}
				clients={clients}
				campaigns={campaigns}
				companies={companies}
				jobTypes={jobTypes}
				totalValue={totalValue}
				t={t}
			/>
		</div>
	);
};

export default JobEntitySelectionFields;
