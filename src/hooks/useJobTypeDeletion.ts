
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type JobType = Database["public"]["Tables"]["job_types"]["Row"];

export const useJobTypeDeletion = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobTypeToDelete, setJobTypeToDelete] = useState<JobType | null>(null);

  const deleteJobTypeMutation = useMutation({
    mutationFn: async (jobTypeId: string) => {
      const { error } = await supabase
        .from("job_types")
        .delete()
        .eq("id", jobTypeId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobTypes"] });
      toast({
        title: t("jobTypes.jobTypeDeleted"),
        description: t("jobTypes.jobTypeDeletedDescription"),
      });
      setDeleteDialogOpen(false);
      setJobTypeToDelete(null);
    },
    onError: (error) => {
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
      deleteJobTypeMutation.mutate(jobTypeToDelete.id);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setJobTypeToDelete(null);
  };

  return {
    deleteDialogOpen,
    jobTypeToDelete,
    handleDeleteJobType,
    confirmDelete,
    cancelDelete,
    isDeleting: deleteJobTypeMutation.isPending,
  };
};
