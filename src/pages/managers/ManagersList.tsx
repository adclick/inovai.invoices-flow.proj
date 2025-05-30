import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ManagerModal from "@/components/managers/ManagerModal";
import { useModalState } from "@/hooks/useModalState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Manager {
  id: string;
  name: string;
  email: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

const ManagersList: React.FC = () => {
  const { t } = useTranslation();
  const { openModal } = useModalState();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [managerToDelete, setManagerToDelete] = useState<Manager | null>(null);

  // Fetch managers
  const { data: managers, isLoading, isError } = useQuery({
    queryKey: ["managers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("managers")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching managers:", error.message);
        throw error;
      }
      return data as Manager[];
    },
  });

  const deleteManagerMutation = useMutation({
    mutationFn: async (managerId: string) => {
      const { error } = await supabase
        .from("managers")
        .delete()
        .eq("id", managerId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managers"] });
      toast({
        title: t("managers.managerDeleted"),
        description: t("managers.managerDeletedDescription"),
      });
      setDeleteDialogOpen(false);
      setManagerToDelete(null);
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: t("managers.managerDeleteError"),
        variant: "destructive",
      });
    },
  });

  // Handler to open the create manager modal
  const handleCreateManager = () => {
    openModal('manager', 'create');
  };

  // Handler to open the edit manager modal
  const handleEditManager = (id: string) => {
    openModal('manager', 'edit', id);
  };

  const handleDeleteManager = (manager: Manager) => {
    setManagerToDelete(manager);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (managerToDelete) {
      deleteManagerMutation.mutate(managerToDelete.id);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <DashboardHeader 
            title={t("managers.title")} 
            showCreateButton
            createButtonText={t("managers.createNew")}
            createButtonAction={handleCreateManager}
          />
          <div className="flex justify-center items-center h-64">
            <p>{t("managers.loadingManagers")}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <DashboardHeader 
            title={t("managers.title")} 
            showCreateButton
            createButtonText={t("managers.createNew")}
            createButtonAction={handleCreateManager}
          />
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
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("managers.name")}</TableHead>
                  <TableHead>{t("common.email")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead className="w-[120px] text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managers.map((manager) => (
                  <TableRow 
                    key={manager.id} 
                    onClick={() => handleEditManager(manager.id)} 
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">
                      {manager.name}
                    </TableCell>
                    <TableCell>
                      {manager.email}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        manager.active
                          ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300"
                      }`}>
                        {manager.active ? t("common.active") : t("common.inactive")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={(e) => { e.stopPropagation(); handleEditManager(manager.id);}}
                          className="hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">{t("common.edit")}</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => { e.stopPropagation(); handleDeleteManager(manager); }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">{t("common.delete")}</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("managers.deleteManager")}</DialogTitle>
            <DialogDescription>
              {t("managers.deleteConfirmation", { name: managerToDelete?.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteManagerMutation.isPending}
            >
              {deleteManagerMutation.isPending ? t("managers.deleting") : t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ManagersList;
