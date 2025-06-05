import React from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import JobTypesListFilters from "@/components/jobs_types/JobTypesListFilters";
import JobTypesTable from "@/components/jobs_types/JobTypesTable";
import JobTypesLoadingState from "@/components/jobs_types/JobTypesLoadingState";
import JobTypesErrorState from "@/components/jobs_types/JobTypesErrorState";
import { useModalState } from "@/hooks/useModalState";
import { useJobTypesListLogic } from "@/hooks/useJobTypesListLogic";
import { useJobTypeDeletion } from "@/hooks/useJobTypeDeletion";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import JobsListPagination from "@/components/jobs/JobsListPagination";
import JobTypeModal from "@/components/jobs_types/JobTypeModal";

const JobsTypesList: React.FC = () => {
	const { t } = useTranslation();
	const { openModal } = useModalState();

	// Use custom hooks for logic
	const {
		paginatedJobTypes,
		isLoading,
		error,
		searchTerm,
		setSearchTerm,
		currentPage,
		setCurrentPage,
		totalPages,
	} = useJobTypesListLogic();

	const {
		isDeleteDialogOpen,
		setIsDeleteDialogOpen,
		jobTypeToDelete,
		handleDeleteClick,
		confirmDelete,
		isDeletingJobType,
	} = useJobTypeDeletion();

	const handleCreateClick = () => {
		openModal('jobType', 'create');
	};

	const handleEditClick = (id: string) => {
		openModal('jobType', 'edit', id);
	};

	if (isLoading) {
		return (
			<DashboardLayout>
				<JobTypesLoadingState
					title={t("jobTypes.title")}
					loadingText={t("jobTypes.loadingJobTypes")}
				/>
			</DashboardLayout>
		);
	}

	if (error) {
		return (
			<DashboardLayout>
				<JobTypesErrorState
					title={t("jobTypes.title")}
					errorMessage={t("jobTypes.errorLoadingJobTypes")}
					error={error as Error}
				/>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className="p-6">
				<div className="flex justify-between items-center mb-6">
					<h1 className="text-2xl font-bold">{t("jobTypes.title")}</h1>
					<Button onClick={handleCreateClick}>
						<PlusCircle className="mr-2 h-4 w-4" />
						{t("jobTypes.createNew")}
					</Button>
				</div>

				<JobTypesListFilters
					searchTerm={searchTerm}
					onSearchChange={setSearchTerm}
					searchPlaceholder={t("jobTypes.searchJobTypes")}
				/>

				{paginatedJobTypes && paginatedJobTypes.length > 0 ? (
					<>
						<JobTypesTable
							jobTypes={paginatedJobTypes}
							onEditJobType={handleEditClick}
							onDeleteJobType={handleDeleteClick}
							t={t}
						/>
						<JobsListPagination
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={setCurrentPage}
						/>
					</>
				) : (
					<div className="flex flex-col items-center justify-center border rounded-lg p-8 bg-slate-50 dark:bg-slate-800">
						<p className="text-slate-500 dark:text-slate-400 mb-4">{t("jobTypes.noJobTypes")}</p>
						<Button onClick={handleCreateClick}>
							{t("jobTypes.createJobType")}
						</Button>
					</div>
				)}

				<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								{t("jobTypes.deleteJobType")}
							</DialogTitle>
							<DialogDescription>
								{t("jobTypes.deleteConfirmation", { name: jobTypeToDelete?.name })}
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
								{t("common.cancel")}
							</Button>
							<Button 
								variant="destructive" 
								onClick={confirmDelete}
								disabled={isDeletingJobType}
							>
								{isDeletingJobType ? t("common.deleting") : t("common.delete")}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
				<JobTypeModal />
			</div>
		</DashboardLayout>
	);
};

export default JobsTypesList;