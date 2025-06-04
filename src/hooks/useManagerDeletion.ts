
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useEntityMutation } from "@/hooks/useEntityMutation";
import { Manager } from "@/types/manager";

export const useManagerDeletion = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [managerToDelete, setManagerToDelete] = useState<Manager | null>(null);

  const { deleteMutation } = useEntityMutation({
    tableName: "managers",
    entityName: "managers",
    queryKey: "managers",
    onSuccess: () => {
      toast({
        title: t("managers.managerDeleted"),
        description: t("managers.managerDeletedDescription"),
      });
      setIsDeleteDialogOpen(false);
      setManagerToDelete(null);
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("managers.managerDeleteError"),
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (manager: Manager) => {
    setManagerToDelete(manager);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (managerToDelete) {
      deleteMutation.mutate(managerToDelete.id);
    }
  };

  return {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    managerToDelete,
    handleDeleteClick,
    confirmDelete,
    isDeletingManager: deleteMutation.isPending,
  };
};
