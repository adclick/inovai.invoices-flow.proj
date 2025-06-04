
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Provider } from "@/types/provider";

export const useProviderDeletion = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<Provider | null>(null);

  const deleteProviderMutation = useMutation({
    mutationFn: async (providerId: string) => {
      const { error } = await supabase
        .from("providers")
        .delete()
        .eq("id", providerId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      toast({
        title: t("providers.providerDeleted"),
        description: t("providers.providerDeletedDescription"),
      });
      setDeleteDialogOpen(false);
      setProviderToDelete(null);
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: t("providers.providerDeleteError"),
        variant: "destructive",
      });
    },
  });

  const handleDelete = (provider: Provider) => {
    setProviderToDelete(provider);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (providerToDelete) {
      deleteProviderMutation.mutate(providerToDelete.id);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setProviderToDelete(null);
  };

  return {
    deleteDialogOpen,
    providerToDelete,
    handleDelete,
    confirmDelete,
    cancelDelete,
    isDeleting: deleteProviderMutation.isPending,
  };
};
