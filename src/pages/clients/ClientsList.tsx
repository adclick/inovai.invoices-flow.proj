
import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PlusCircle } from "lucide-react";
import { useModalState } from "@/hooks/useModalState";
import { useClientsListLogic } from "@/hooks/useClientsListLogic";
import { useClientDeletion } from "@/hooks/useClientDeletion";
import ClientModal from "@/components/clients/ClientModal";
import ClientsListFilters from "@/components/clients/ClientsListFilters";
import ClientsTable from "@/components/clients/ClientsTable";
import ClientsListPagination from "@/components/clients/ClientsListPagination";
import JobsEmptyState from "@/components/jobs/JobsEmptyState";
import JobsLoadingState from "@/components/jobs/JobsLoadingState";
import JobsErrorState from "@/components/jobs/JobsErrorState";

const ClientsList = () => {
  const { t } = useTranslation();
  const { openModal } = useModalState();

  const {
    clients,
    paginatedClients,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
  } = useClientsListLogic();

  const {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    clientToDelete,
    handleDeleteClick,
    confirmDelete,
    isDeletingClient,
  } = useClientDeletion();

  const handleEditClient = (id: string) => {
    openModal('client', 'edit', id);
  };

  const handleCreateClient = () => {
    openModal('client', 'create');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <JobsLoadingState 
          title={t("clients.title")} 
          loadingText={t("clients.loadingClients")} 
        />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <JobsErrorState 
          title={t("clients.title")} 
          errorMessage={t("clients.errorLoadingClients")} 
          error={error as Error} 
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t("clients.title")}</h1>
          <Button onClick={handleCreateClient}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("clients.createNew")}
          </Button>
        </div>

        {clients && clients.length === 0 ? (
          <JobsEmptyState
            title={t("clients.noClients")}
            description={t("clients.getStarted")}
            createButtonText={t("clients.createFirstClient")}
            onCreateJob={handleCreateClient}
          />
        ) : (
          <>
            <ClientsListFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              searchPlaceholder={t("clients.searchClients")}
              filterByStatusText={t("clients.filterByStatus")}
              t={t}
            />

            <ClientsTable
              clients={paginatedClients}
              onEditClient={handleEditClient}
              onDeleteClick={handleDeleteClick}
              t={t}
            />

            <ClientsListPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("clients.deleteClient")}</DialogTitle>
              <DialogDescription>
                {t("clients.deleteConfirmation", { name: clientToDelete?.name })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeletingClient}
              >
                {isDeletingClient ? t("clients.deleting") : t("common.delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Client modal */}
        <ClientModal />
      </div>
    </DashboardLayout>
  );
};

export default ClientsList;
