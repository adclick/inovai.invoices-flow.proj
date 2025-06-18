
import React, { useMemo } from "react";
import { Control, useFormContext } from "react-hook-form";
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
	const { watch } = useFormContext<JobFormValues>();
	const lineItems = watch("line_items");
	const hasLineItems = lineItems && lineItems.length > 0;

	// Filter status options based on line items presence
	const availableStatusOptions = useMemo(() => {
		if (!hasLineItems) {
			return statusOptions.filter(option => option.value === "draft");
		}
		return statusOptions;
	}, [hasLineItems, statusOptions]);

	return (
		<div className="grid grid-cols-1 gap-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="space-y-2">
					<OptionalSelectField
						control={control}
						name="status"
						label={t("jobs.status")}
						placeholder={t("jobs.selectStatus")}
						options={availableStatusOptions}
						t={t}
					/>
					{!hasLineItems && (
						<p className="text-xs text-amber-600 dark:text-amber-400">
							{t("jobs.statusLimitedWithoutLineItems")}
						</p>
					)}
				</div>
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
