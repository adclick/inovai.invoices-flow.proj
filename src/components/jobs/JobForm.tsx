
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BaseEntityFormProps } from "../common/EntityModal";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useJobFormData } from "@/hooks/useJobFormData";
import { useJobFormLogic } from "@/hooks/useJobFormLogic";
import JobBasicInfoFields from "./JobBasicInfoFields";
import JobEntitySelectionFields from "./JobEntitySelectionFields";
import JobNotesFields from "./JobNotesFields";

const JobForm: React.FC<BaseEntityFormProps> = ({
	id,
	mode,
	onClose,
	onSuccess
}) => {
	const { t } = useTranslation();

	// Only allow create and edit modes for this form
	const formMode = mode === "view" ? "edit" : mode;

	// Fetch all required data
	const {
		clients,
		campaigns,
		providers,
		managers,
		companies,
		jobTypes,
		statusOptions,
		isLoading: dataLoading,
	} = useJobFormData();

	// Handle form logic
	const {
		form,
		totalValue,
		hasLineItems,
		handleSave,
		handleSaveAndClose,
		isSubmitting,
	} = useJobFormLogic({
		id,
		mode: formMode,
		onClose,
		onSuccess,
		campaigns,
	});

	const isLoading = dataLoading || isSubmitting;
	const isReadOnly = mode === "view";

	// Show loading state when editing and data is still loading
	const shouldShowLoading = id && mode === "edit" && isLoading;

	if (shouldShowLoading) {
		return (
			<div className="space-y-8">
				<div className="flex items-center justify-center p-8">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
						<p className="text-slate-600 dark:text-slate-400">{t("common.loading")}</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<Form {...form}>
				<form className="space-y-8">

					{/* Basic Information Section */}
					<div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl border-2 border-slate-200 dark:border-slate-600 shadow-sm">
						<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
							<div className="w-2 h-6 bg-gradient-to-b from-primary to-sidebar-accent rounded-full"></div>
							{t("jobs.basic_info")}
						</h3>
						<JobBasicInfoFields
							control={form.control}
							statusOptions={statusOptions}
							t={t}
						/>
					</div>

					{/* Entity Selection Section */}
					<div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl border-2 border-slate-200 dark:border-slate-600 shadow-sm">
						<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
							<div className="w-2 h-6 bg-gradient-to-b from-primary to-sidebar-accent rounded-full"></div>
							{t("jobs.associations")}
						</h3>
						<JobEntitySelectionFields
							control={form.control}
							clients={clients}
							campaigns={campaigns}
							providers={providers}
							managers={managers}
							companies={companies}
							jobTypes={jobTypes}
							totalValue={totalValue}
							t={t}
						/>
					</div>

					{/* Notes Section */}
					<div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl border-2 border-slate-200 dark:border-slate-600 shadow-sm">
						<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
							<div className="w-2 h-6 bg-gradient-to-b from-primary to-sidebar-accent rounded-full"></div>
							{t("jobs.notes")}
						</h3>
						<JobNotesFields
							control={form.control}
							t={t}
						/>
					</div>

					{/* Action Buttons */}
					{!isReadOnly && (
						<div className="sticky bottom-0 z-10 bg-white dark:bg-slate-900 p-6 border-t-2 border-slate-200 dark:border-slate-600 -mx-6 -mb-6 rounded-b-xl bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
							<div className="flex justify-end space-x-4">
								<Button type="button" variant="outline" onClick={onClose} size="lg">
									{t("common.cancel")}
								</Button>
								<Button 
									type="button" 
									variant="secondary" 
									onClick={form.handleSubmit(handleSave)} 
									disabled={isLoading} 
									size="lg"
								>
									{isLoading
										? formMode === "edit"
											? t("common.updating")
											: t("common.creating")
										: t("common.save")}
								</Button>
								<Button 
									type="button" 
									onClick={form.handleSubmit(handleSaveAndClose)} 
									disabled={isLoading} 
									size="lg"
								>
									{isLoading
										? formMode === "edit"
											? t("common.updating")
											: t("common.creating")
										: t("common.saveAndClose")}
								</Button>
							</div>
						</div>
					)}
				</form>
			</Form>
		</div>
	);
};

export default JobForm;
