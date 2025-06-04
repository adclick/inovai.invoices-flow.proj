
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useEntityMutation } from "@/hooks/useEntityMutation";
import { Job } from "@/types/job";

export const useJobDeletion = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  const { deleteMutation } = useEntityMutation({
    tableName: "jobs",
    entityName: "jobs",
    queryKey: "jobs",
    onSuccess: () => {
      toast({
        title: t("jobs.deleteSuccess"),
        description: t("jobs.jobDeletedDescription"),
      });
      setIsDeleteDialogOpen(false);
      setJobToDelete(null);
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("jobs.deleteError"),
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (e: React.MouseEvent, job: Job) => {
    e.stopPropagation();
    setJobToDelete(job);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (jobToDelete) {
      deleteMutation.mutate(jobToDelete.id);
    }
  };

  return {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    jobToDelete,
    handleDeleteClick,
    confirmDelete,
    isDeletingJob: deleteMutation.isPending,
  };
};
