
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useModalState } from "@/hooks/useModalState";
import { useJobsListLogic } from "@/hooks/useJobsListLogic";
import { useJobDeletion } from "@/hooks/useJobDeletion";
import { useCompaniesData } from "@/hooks/useCompaniesData";
import JobModal from "@/components/jobs/JobModal";
import JobsListHeader from "@/components/jobs/JobsListHeader";
import JobsListFilters from "@/components/jobs/JobsListFilters";
import JobsTable from "@/components/jobs/JobsTable";
import JobsListPagination from "@/components/jobs/JobsListPagination";
import JobsEmptyState from "@/components/jobs/JobsEmptyState";
import JobsLoadingState from "@/components/jobs/JobsLoadingState";
import JobsErrorState from "@/components/jobs/JobsErrorState";

const JobsAllList: React.FC = () => {
  const { t } = useTranslation();
  const { openModal } = useModalState();
  const navigate = useNavigate();

  const {
    jobs,
    paginatedJobs,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    companyFilter,
  } = useJobsListLogic();

  const { data: companies } = useCompaniesData();

  const {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    jobToDelete,
    handleDeleteClick,
    confirmDelete,
  } = useJobDeletion();

  // Get current company name for display
  const currentCompany = companies?.find(company => company.id === companyFilter);

  // Redirect to first company if no company is selected and companies exist
  useEffect(() => {
    if (!companyFilter && companies && companies.length > 0) {
      const firstActiveCompany = companies.find(company => company.active);
      if (firstActiveCompany) {
        navigate(`/jobs?company=${firstActiveCompany.id}`, { replace: true });
      }
    }
  }, [companyFilter, companies, navigate]);

  const handleCreateJob = () => {
    openModal("job", "create");
  };

  const handleEditJob = (id: string) => {
    openModal("job", "edit", id);
  };

  // Show loading while redirecting or fetching data
  if (isLoading || (!companyFilter && companies && companies.length > 0)) {
    return (
      <DashboardLayout>
        <JobsLoadingState 
          title={t("jobs.title")} 
          loadingText={t("jobs.loadingJobs")} 
        />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <JobsErrorState 
          title={t("jobs.title")} 
          errorMessage={t("jobs.errorLoadingJobs")} 
          error={error as Error} 
        />
      </DashboardLayout>
    );
  }

  // If no companies exist, show empty state
  if (companies && companies.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <JobsEmptyState
            title={t("jobs.noCompaniesFound")}
            description={t("jobs.createCompanyFirst")}
            createButtonText={t("companies.createNew")}
            onCreateJob={() => navigate("/companies")}
          />
        </div>
      </DashboardLayout>
    );
  }

  const pageTitle = currentCompany 
    ? `${t("jobs.title")} - ${currentCompany.name}`
    : t("jobs.title");

  return (
    <DashboardLayout>
      <div className="p-6">
        <JobsListHeader
          title={pageTitle}
          createButtonText={t("jobs.createNew")}
          onCreateJob={handleCreateJob}
        />

        {jobs && jobs.length === 0 ? (
          <JobsEmptyState
            title={t("jobs.noJobsFound")}
            description={t("jobs.getStarted")}
            createButtonText={t("jobs.createNew")}
            onCreateJob={handleCreateJob}
          />
        ) : (
          <>
            <JobsListFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              searchPlaceholder={t("jobs.searchJobs")}
              filterByStatusText={t("jobs.filterByStatus")}
              t={t}
            />

            <JobsTable
              jobs={paginatedJobs}
              onEditJob={handleEditJob}
              onDeleteClick={handleDeleteClick}
              t={t}
            />

            <JobsListPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}

        <JobModal />
        
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("jobs.deleteJob")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("jobs.deleteConfirmation")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                {t("common.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default JobsAllList;
