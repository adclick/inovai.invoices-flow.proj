import React from "react";
import { Control } from "react-hook-form";
import { JobFormValues } from "@/hooks/useJobFormLogic";
import RequiredTextField from "@/components/common/form/RequiredTextField";
import OptionalSelectField from "@/components/common/form/OptionalSelectField";
import DocumentsField from "@/components/common/form/DocumentsField";
import OptionalDateField from "@/components/common/form/OptionalDateField";
import { SelectOption, NUMERIC_MONTH_OPTIONS } from "@/utils/formConstants";

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

			<div className="grid grid-cols-2 gap-4">
				<RequiredTextField
					control={control}
					name="year"
					label={t("jobs.year")}
					placeholder={t("jobs.yearPlaceholder")}
					type="number"
					min="1900"
					max="2100"
				/>

				<OptionalSelectField
					control={control}
					name="month"
					label={t("jobs.month")}
					placeholder={t("jobs.selectMonth")}
					options={NUMERIC_MONTH_OPTIONS}
					t={t}
				/>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<OptionalSelectField
					control={control}
					name="status"
					label={t("jobs.status")}
					placeholder={t("jobs.selectStatus")}
					options={statusOptions}
					t={t}
				/>

				<RequiredTextField
					control={control}
					name="value"
					label={t("jobs.value")}
					placeholder={t("jobs.value")}
					type="number"
					min="0"
					step="0.01"
				/>
			</div>

			<OptionalDateField
				control={control}
				name="payment_date"
				label={t("jobs.paymentDate")}
				placeholder={t("jobs.paymentDatePlaceholder")}
			/>

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
