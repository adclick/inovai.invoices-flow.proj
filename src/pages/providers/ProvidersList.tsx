
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
import { useModalState } from "@/hooks/useModalState";
import { PlusCircle } from "lucide-react";
import ProviderModal from "@/components/providers/ProviderModal";
import ProvidersListFilters from "@/components/providers/ProvidersListFilters";
import ProvidersTable from "@/components/providers/ProvidersTable";
import ProvidersListPagination from "@/components/providers/ProvidersListPagination";
import { useProvidersListLogic } from "@/hooks/useProvidersListLogic";
import { useProviderDeletion } from "@/hooks/useProviderDeletion";

const ProvidersList = () => {
  const { t } = useTranslation();
  const { openModal } = useModalState();

  const {
    paginatedProviders,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
  } = useProvidersListLogic();

  const {
    deleteDialogOpen,
    providerToDelete,
    handleDelete,
    confirmDelete,
    cancelDelete,
    isDeleting,
  } = useProviderDeletion();

  const handleCreateProvider = () => {
    openModal('provider', 'create');
  };

  const handleEditProvider = (id: string) => {
    openModal('provider', 'edit', id);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{t("providers.title")}</h1>
            <Button onClick={handleCreateProvider}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("providers.createNew")}
            </Button>
          </div>
          <div className="flex justify-center items-center h-64">
            <p>{t("providers.loadingProviders")}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{t("providers.title")}</h1>
            <Button onClick={handleCreateProvider}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("providers.createNew")}
            </Button>
          </div>
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">{t("providers.errorLoadingProviders")}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t("providers.title")}</h1>
          <Button onClick={handleCreateProvider}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("providers.createNew")}
          </Button>
        </div>

        <ProvidersListFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          t={t}
        />

        {paginatedProviders && paginatedProviders.length > 0 ? (
          <>
            <ProvidersTable
              providers={paginatedProviders}
              onEditProvider={handleEditProvider}
              onDeleteClick={handleDelete}
              t={t}
            />
            <ProvidersListPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              t={t}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center border rounded-lg p-8 bg-slate-50 dark:bg-slate-800">
            <p className="text-slate-500 dark:text-slate-400 mb-4">{t("providers.noProviders")}</p>
            <Button onClick={handleCreateProvider}>
              {t("providers.createFirstProvider")}
            </Button>
          </div>
        )}

        <Dialog open={deleteDialogOpen} onOpenChange={cancelDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("providers.deleteProvider")}</DialogTitle>
              <DialogDescription>
                {t("providers.deleteConfirmation", { name: providerToDelete?.name })}
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
                {isDeleting ? t("providers.deleting") : t("common.delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ProviderModal />
      </div>
    </DashboardLayout>
  );
};

export default ProvidersList;
