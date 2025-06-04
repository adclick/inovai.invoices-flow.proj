
import React from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import JobTypeModal from "@/components/jobs_types/JobTypeModal";
import JobTypesTable from "@/components/jobs_types/JobTypesTable";
import JobsLoadingState from "@/components/jobs/JobsLoadingState";
import JobsErrorState from "@/components/jobs/JobsErrorState";
import JobsEmptyState from "@/components/jobs/JobsEmptyState";
import { useModalState } from "@/hooks/useModalState";
import { useJobTypesData } from "@/hooks/useJobTypesData";
import { useJobTypesListLogic } from "@/hooks/useJobTypesListLogic";
import { useJobTypeDeletion } from "@/hooks/useJobTypeDeletion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const JobsTypesList: React.FC = () => {
  const { t } = useTranslation();
  const { openModal } = useModalState();
  
  // Data fetching
  const { data: jobTypes, isLoading, isError, error } = useJobTypesData();
  
  // List logic - only pass data if it's an array of valid job types
  const validJobTypes = Array.isArray(jobTypes) && jobTypes.length >= 0 && !isError ? jobTypes : [];
  
  const {
    searchTerm,
    statusFilter,
    currentPage,
    paginatedJobTypes,
    totalPages,
    handleSearchChange,
    handleStatusFilterChange,
    setCurrentPage,
  } = useJobTypesListLogic(validJobTypes);

  // Deletion logic
  const {
    deleteDialogOpen,
    setDeleteDialogOpen,
    jobTypeToDelete,
    handleDeleteJobType,
    confirmDelete,
    deleteMutation,
  } = useJobTypeDeletion();

  // Modal handlers
  const handleCreateJobType = () => {
    openModal('jobType', 'create');
  };

  const handleEditJobType = (id: string) => {
    openModal('jobType', 'edit', id);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <JobsLoadingState 
          title={t("jobTypes.title")}
          loadingText={t("jobTypes.loadingJobTypes")} 
        />
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <JobsErrorState 
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
          <Button onClick={handleCreateJobType}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("jobTypes.createNew")}
          </Button>
        </div>

        {validJobTypes && validJobTypes.length > 0 ? (
          <JobTypesTable
            jobTypes={paginatedJobTypes}
            onEditJobType={handleEditJobType}
            onDeleteClick={handleDeleteJobType}
            t={t}
          />
        ) : (
          <JobsEmptyState
            title={t("jobTypes.noData")}
            description=""
            createButtonText={t("jobTypes.createFirstJobType")}
            onCreateJob={handleCreateJobType}
          />
        )}
      </div>

      <JobTypeModal />
      
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("jobTypes.deleteJobType")}</DialogTitle>
            <DialogDescription>
              {t("jobTypes.deleteConfirmation", { name: jobTypeToDelete?.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? t("jobTypes.deleting") : t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default JobsTypesList;
