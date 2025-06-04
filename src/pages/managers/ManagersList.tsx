
import React from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ManagerModal from "@/components/managers/ManagerModal";
import { useModalState } from "@/hooks/useModalState";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useManagersListLogic } from "@/hooks/useManagersListLogic";
import { useManagerDeletion } from "@/hooks/useManagerDeletion";
import ManagersListFilters from "@/components/managers/ManagersListFilters";
import ManagersTable from "@/components/managers/ManagersTable";
import ManagersListPagination from "@/components/managers/ManagersListPagination";

const ManagersList: React.FC = () => {
  const { t } = useTranslation();
  const { openModal } = useModalState();

  const {
    managers,
    paginatedManagers,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
  } = useManagersListLogic();

  const {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    managerToDelete,
    handleDeleteClick,
    confirmDelete,
    isDeletingManager,
  } = useManagerDeletion();

  const handleCreateManager = () => {
    openModal('manager', 'create');
  };

  const handleEditManager = (id: string) => {
    openModal('manager', 'edit', id);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{t("managers.title")}</h1>
            <Button onClick={handleCreateManager}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("managers.createNew")}
            </Button>
          </div>
          <div className="flex justify-center items-center h-64">
            <p>{t("managers.loadingManagers")}</p>
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
            <h1 className="text-2xl font-bold">{t("managers.title")}</h1>
            <Button onClick={handleCreateManager}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("managers.createNew")}
            </Button>
          </div>
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">{t("managers.errorLoadingManagers")}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t("managers.title")}</h1>
          <Button onClick={handleCreateManager}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("managers.createNew")}
          </Button>
        </div>

        {managers && managers.length > 0 ? (
          <>
            <ManagersListFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              searchPlaceholder={t("managers.searchManagers")}
              filterByStatusText={t("managers.filterByStatus")}
              t={t}
            />

            <ManagersTable
              managers={paginatedManagers}
              onEditManager={handleEditManager}
              onDeleteClick={handleDeleteClick}
              t={t}
            />

            <ManagersListPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center border rounded-lg p-8 bg-slate-50 dark:bg-slate-800">
            <p className="text-slate-500 dark:text-slate-400 mb-4">{t("managers.noData")}</p>
            <Button onClick={handleCreateManager}>
              {t("managers.createFirstManager")}
            </Button>
          </div>
        )}
      </div>
      <ManagerModal />
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("managers.deleteManager")}</DialogTitle>
            <DialogDescription>
              {t("managers.deleteConfirmation", { name: managerToDelete?.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeletingManager}
            >
              {isDeletingManager ? t("managers.deleting") : t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ManagersList;
