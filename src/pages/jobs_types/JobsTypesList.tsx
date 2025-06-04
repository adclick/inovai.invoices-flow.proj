
import React from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import JobTypeModal from "@/components/jobs_types/JobTypeModal";
import JobTypesListHeader from "@/components/jobs_types/JobTypesListHeader";
import JobTypesListFilters from "@/components/jobs_types/JobTypesListFilters";
import JobTypesTable from "@/components/jobs_types/JobTypesTable";
import JobTypesLoadingState from "@/components/jobs_types/JobTypesLoadingState";
import JobTypesErrorState from "@/components/jobs_types/JobTypesErrorState";
import JobTypesEmptyState from "@/components/jobs_types/JobTypesEmptyState";
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
import { Button } from "@/components/ui/button";

const JobsTypesList: React.FC = () => {
  const { t } = useTranslation();
  const { openModal } = useModalState();
  
  // Fetch job types data
  const { data: jobTypes, isLoading, isError, error } = useJobTypesData();
  
  // List logic (search, filtering, etc.)
  const {
    searchTerm,
    handleSearchChange,
    filteredJobTypes,
  } = useJobTypesListLogic(jobTypes);
  
  // Deletion logic
  const {
    deleteDialogOpen,
    jobTypeToDelete,
    handleDeleteJobType,
    confirmDelete,
    cancelDelete,
    isDeleting,
  } = useJobTypeDeletion();

  // Handler to open the create job type modal
  const handleCreateJobType = () => {
    openModal('jobType', 'create');
  };

  // Handler to open the edit job type modal
  const handleEditJobType = (id: string) => {
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

  if (isError) {
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
        <JobTypesListHeader
          title={t("jobTypes.title")}
          createButtonText={t("jobTypes.createNew")}
          onCreateJobType={handleCreateJobType}
        />

        <JobTypesListFilters
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          searchPlaceholder={t("jobTypes.searchPlaceholder")}
        />

        {filteredJobTypes && filteredJobTypes.length > 0 ? (
          <JobTypesTable
            jobTypes={filteredJobTypes}
            onEditJobType={handleEditJobType}
            onDeleteJobType={handleDeleteJobType}
          />
        ) : (
          <JobTypesEmptyState
            title={t("jobTypes.noJobTypesFound")}
            description={t("jobTypes.noData")}
            createButtonText={t("jobTypes.createFirstJobType")}
            onCreateJobType={handleCreateJobType}
          />
        )}
      </div>
      
      <JobTypeModal />
      
      <Dialog open={deleteDialogOpen} onOpenChange={cancelDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("jobTypes.deleteJobType")}</DialogTitle>
            <DialogDescription>
              {t("jobTypes.deleteConfirmation", { name: jobTypeToDelete?.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDelete}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? t("jobTypes.deleting") : t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default JobsTypesList;
