
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useTranslation } from "react-i18next";
import { useModalState } from "@/hooks/useModalState";
import CampaignModal from "@/components/campaigns/CampaignModal";
import { useCampaignsListLogic } from "@/hooks/useCampaignsListLogic";
import { useCampaignDeletion } from "@/hooks/useCampaignDeletion";
import CampaignsListFilters from "@/components/campaigns/CampaignsListFilters";
import CampaignsTable from "@/components/campaigns/CampaignsTable";
import JobsListPagination from "@/components/jobs/JobsListPagination";
import JobsLoadingState from "@/components/jobs/JobsLoadingState";
import JobsErrorState from "@/components/jobs/JobsErrorState";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
    isDeletingCampaign,
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
				<div className="flex justify-between items-center mb-6">
					<h1 className="text-2xl font-bold">{t("campaigns.title")}</h1>
					<Button onClick={handleCreateClick}>
						<PlusCircle className="mr-2 h-4 w-4" />
						{t("campaigns.createNew")}
					</Button>
				</div>

				<CampaignsListFilters
					searchTerm={searchTerm}
					onSearchChange={setSearchTerm}
					statusFilter={statusFilter}
					onStatusFilterChange={setStatusFilter}
					searchPlaceholder={t("campaigns.searchCampaigns")}
					filterByStatusText={t("campaigns.filterByStatus")}
					t={t}
				/>

				{paginatedCampaigns && paginatedCampaigns.length > 0 ? (
					<>
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
				) : (
					<div className="flex flex-col items-center justify-center border rounded-lg p-8 bg-slate-50 dark:bg-slate-800">
						<p className="text-slate-500 dark:text-slate-400 mb-4">{t("campaigns.noCampaigns")}</p>
						<Button onClick={handleCreateClick}>
							{t("campaigns.createCampaign")}
						</Button>
					</div>
				)}

				<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								{t("campaigns.deleteCampaign")}
							</DialogTitle>
							<DialogDescription>
								{t("campaigns.deleteConfirmation", { name: campaignToDelete?.name })}
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
								{t("common.cancel")}
								</Button>
								<Button 
								variant="destructive" 
								onClick={confirmDelete}
								disabled={isDeletingCampaign}
								>
									{isDeletingCampaign ? t("common.deleting") : t("common.delete")}
								</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
				<CampaignModal />
			</div>
    </DashboardLayout>
  );
};

export default CampaignsList;
