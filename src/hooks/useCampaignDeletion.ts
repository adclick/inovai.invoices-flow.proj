
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useEntityMutation } from "@/hooks/useEntityMutation";

type Campaign = {
  id: string;
  name: string;
  active: boolean;
  client_id: string;
  client_name?: string;
  duration: number;
  estimated_cost: number | null;
  revenue: number | null;
  created_at: string;
};

export const useCampaignDeletion = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);

  const { deleteMutation } = useEntityMutation({
    tableName: "campaigns",
    entityName: "campaigns",
    queryKey: "campaigns",
    onSuccess: () => {
      toast({
        title: t("campaigns.campaignDeleted"),
        description: t("campaigns.campaignDeletedDescription"),
      });
      setIsDeleteDialogOpen(false);
      setCampaignToDelete(null);
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("campaigns.campaignDeleteError"),
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (campaign: Campaign) => {
    setCampaignToDelete(campaign);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (campaignToDelete) {
      deleteMutation.mutate(campaignToDelete.id);
    }
  };

  return {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    campaignToDelete,
    handleDeleteClick,
    confirmDelete,
    isDeletingCampaign: deleteMutation.isPending,
  };
};
