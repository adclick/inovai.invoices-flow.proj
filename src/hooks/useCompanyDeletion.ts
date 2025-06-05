
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useEntityMutation } from "@/hooks/useEntityMutation";

export const useCompanyDeletion = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);

  const { deleteMutation } = useEntityMutation({
    tableName: "companies",
    entityName: "companies",
    queryKey: "companies",
    onSuccess: () => {
      toast({
        title: t("companies.deleted"),
      });
      setIsDeleteDialogOpen(false);
      setCompanyToDelete(null);
    },
    onError: () => {
      setIsDeleteDialogOpen(false);
      setCompanyToDelete(null);
    },
  });

  const handleDeleteClick = (id: string) => {
    setCompanyToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (companyToDelete) {
      deleteMutation.mutate(companyToDelete);
    }
  };

  return {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    companyToDelete,
    handleDeleteClick,
    confirmDelete,
  };
};
