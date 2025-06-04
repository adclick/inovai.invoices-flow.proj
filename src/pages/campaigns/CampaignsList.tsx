
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useTranslation } from "react-i18next";
import { useModalState } from "@/hooks/useModalState";
import CampaignModal from "@/components/campaigns/CampaignModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useCampaignsListLogic } from "@/hooks/useCampaignsListLogic";
import { useCampaignDeletion } from "@/hooks/useCampaignDeletion";
import JobsListHeader from "@/components/jobs/JobsListHeader";
import CampaignsListFilters from "@/components/campaigns/CampaignsListFilters";
import CampaignsTable from "@/components/campaigns/CampaignsTable";
import JobsListPagination from "@/components/jobs/JobsListPagination";
import JobsEmptyState from "@/components/jobs/JobsEmptyState";
import JobsLoadingState from "@/components/jobs/JobsLoadingState";
import JobsErrorState from "@/components/jobs/JobsErrorState";

const CampaignsList = () => {
  const { t } = useTranslation();
  const { openModal } = useModalState();

  // Use custom hooks for logic
  const {
    paginatedCampaigns,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
  } = useCampaignsListLogic();

  const {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    campaignToDelete,
    handleDeleteClick,
    confirmDelete,
  } = useCampaignDeletion();

  const handleCreateClick = () => {
    openModal('campaign', 'create');
  };

  const handleEditClick = (id: string) => {
    openModal('campaign', 'edit', id);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <JobsLoadingState
          title={t("campaigns.title")}
          loadingText={t("campaigns.loadingCampaigns")}
        />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <JobsErrorState
          title={t("campaigns.title")}
          errorMessage={t("campaigns.errorLoadingCampaigns")}
          error={error as Error}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <JobsListHeader
          title={t("campaigns.title")}
          createButtonText={t("campaigns.createNew")}
          onCreateJob={handleCreateClick}
        />

        {paginatedCampaigns.length === 0 ? (
          <JobsEmptyState
            title={t("campaigns.noCampaigns")}
            description={t("campaigns.getStarted")}
            createButtonText={t("campaigns.createCampaign")}
            onCreateJob={handleCreateClick}
          />
        ) : (
          <>
            <CampaignsListFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              searchPlaceholder={t("campaigns.searchCampaigns")}
              filterByStatusText={t("campaigns.filterByStatus")}
              t={t}
            />

            <CampaignsTable
              campaigns={paginatedCampaigns}
              onEditCampaign={handleEditClick}
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
      </div>

      <CampaignModal />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("campaigns.deleteCampaign")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("campaigns.confirmDelete", { name: campaignToDelete?.name })}
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
    </DashboardLayout>
  );
};

export default CampaignsList;
