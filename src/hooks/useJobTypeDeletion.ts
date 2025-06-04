
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useEntityMutation } from "@/hooks/useEntityMutation";
import { Database } from "@/integrations/supabase/types";

type JobType = Database["public"]["Tables"]["job_types"]["Row"];

export const useJobTypeDeletion = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobTypeToDelete, setJobTypeToDelete] = useState<JobType | null>(null);

  const { deleteMutation } = useEntityMutation({
    tableName: "job_types",
    entityName: "jobTypes",
    queryKey: "job_types",
    onSuccess: () => {
      toast({
        title: t("jobTypes.jobTypeDeleted"),
        description: t("jobTypes.jobTypeDeletedDescription"),
      });
      setDeleteDialogOpen(false);
      setJobTypeToDelete(null);
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("jobTypes.jobTypeDeleteError"),
        variant: "destructive",
      });
    },
  });

  const handleDeleteJobType = (jobType: JobType) => {
    setJobTypeToDelete(jobType);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (jobTypeToDelete) {
      deleteMutation.mutate(jobTypeToDelete.id);
    }
  };

  return {
    deleteDialogOpen,
    setDeleteDialogOpen,
    jobTypeToDelete,
    handleDeleteJobType,
    confirmDelete,
    deleteMutation,
  };
};
