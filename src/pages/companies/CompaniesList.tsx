
import React from "react";
import { useTranslation } from "react-i18next";
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
import { useCompaniesListLogic } from "@/hooks/useCompaniesListLogic";
import { useCompanyDeletion } from "@/hooks/useCompanyDeletion";
import CompanyModal from "@/components/companies/CompanyModal";
import CompaniesListHeader from "@/components/companies/CompaniesListHeader";
import CompaniesListFilters from "@/components/companies/CompaniesListFilters";
import CompaniesTable from "@/components/companies/CompaniesTable";
import CompaniesListPagination from "@/components/companies/CompaniesListPagination";
import CompaniesEmptyState from "@/components/companies/CompaniesEmptyState";
import CompaniesLoadingState from "@/components/companies/CompaniesLoadingState";
import CompaniesErrorState from "@/components/companies/CompaniesErrorState";

const CompaniesList: React.FC = () => {
  const { t } = useTranslation();
  const { openModal } = useModalState();

  const {
    companies,
    paginatedCompanies,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
  } = useCompaniesListLogic();

  const {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    companyToDelete,
    handleDeleteClick,
    confirmDelete,
  } = useCompanyDeletion();

  const handleCreateCompany = () => {
    openModal("company", "create");
  };

  const handleEditCompany = (id: string) => {
    openModal("company", "edit", id);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <CompaniesLoadingState 
          title={t("companies.title")} 
          loadingText={t("companies.loadingCompanies")} 
        />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <CompaniesErrorState 
          title={t("companies.title")} 
          errorMessage={t("companies.errorLoadingCompanies")} 
          error={error as Error} 
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <CompaniesListHeader
          title={t("companies.title")}
          createButtonText={t("companies.createNew")}
          onCreateCompany={handleCreateCompany}
        />

        {companies && companies.length === 0 ? (
          <CompaniesEmptyState
            title={t("companies.noCompaniesFound")}
            description={t("companies.getStarted")}
            createButtonText={t("companies.createNew")}
            onCreateCompany={handleCreateCompany}
          />
        ) : (
          <>
            <CompaniesListFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              searchPlaceholder={t("companies.searchCompanies")}
              filterByStatusText={t("companies.filterByStatus")}
              t={t}
            />

            <CompaniesTable
              companies={paginatedCompanies}
              onEditCompany={handleEditCompany}
              onDeleteClick={handleDeleteClick}
              t={t}
            />

            <CompaniesListPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}

        <CompanyModal />
        
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("companies.deleteCompany")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("companies.deleteConfirmation")}
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

export default CompaniesList;
