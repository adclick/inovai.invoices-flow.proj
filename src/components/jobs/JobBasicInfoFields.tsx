
import React from "react";
import { Control } from "react-hook-form";
import { JobFormValues } from "@/hooks/useJobFormLogic";
import OptionalSelectField from "@/components/common/form/OptionalSelectField";
import DocumentsField from "@/components/common/form/DocumentsField";
import OptionalDateField from "@/components/common/form/OptionalDateField";
import { SelectOption } from "@/utils/formConstants";

interface JobBasicInfoFieldsProps {
	control: Control<JobFormValues>;
	statusOptions: SelectOption[];
	t: (key: string) => string;
}

const JobBasicInfoFields: React.FC<JobBasicInfoFieldsProps> = ({
	control,
	statusOptions,
	t,
}) => {
	return (
		<div className="grid grid-cols-1 gap-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<OptionalSelectField
					control={control}
					name="status"
					label={t("jobs.status")}
					placeholder={t("jobs.selectStatus")}
					options={statusOptions}
					t={t}
				/>
			<OptionalDateField
				control={control}
				name="payment_date"
				label={t("jobs.paymentDate")}
				placeholder={t("jobs.paymentDatePlaceholder")}
			/>
			</div>

			<DocumentsField
				control={control}
				name="documents"
				label={t("common.invoice")}
				placeholder={t("jobs.documentsPlaceholder")}
				helpText={t("jobs.documentsHelp")}
				rows={4}
			/>
		</div>
	);
};

export default JobBasicInfoFields;
