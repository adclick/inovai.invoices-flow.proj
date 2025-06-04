
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useEntityMutation } from "@/hooks/useEntityMutation";
import { Client } from "@/types/client";

export const useClientDeletion = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const { deleteMutation } = useEntityMutation({
    tableName: "clients",
    entityName: "clients",
    queryKey: "clients",
    onSuccess: () => {
      toast({
        title: t("clients.clientDeleted"),
        description: t("clients.clientDeletedDescription"),
      });
      setIsDeleteDialogOpen(false);
      setClientToDelete(null);
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("clients.clientDeleteError"),
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (clientToDelete) {
      deleteMutation.mutate(clientToDelete.id);
    }
  };

  return {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    clientToDelete,
    handleDeleteClick,
    confirmDelete,
    isDeletingClient: deleteMutation.isPending,
  };
};
