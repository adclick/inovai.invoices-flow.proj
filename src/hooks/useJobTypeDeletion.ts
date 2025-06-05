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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [jobTypeToDelete, setJobTypeToDelete] = useState<JobType | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("job_types")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobTypes"] });
      toast({
        title: t("common.success"),
        description: t("jobTypes.deleteSuccess"),
      });
      setIsDeleteDialogOpen(false);
      setJobTypeToDelete(null);
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: t("jobTypes.deleteError"),
        variant: "destructive",
      });
      console.error("Error deleting job type:", error);
    },
  });

  const handleDeleteClick = (jobType: JobType) => {
    setJobTypeToDelete(jobType);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (jobTypeToDelete) {
      deleteMutation.mutate(jobTypeToDelete.id);
    }
  };

  return {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    jobTypeToDelete,
    handleDeleteClick,
    confirmDelete,
    isDeletingJobType: deleteMutation.isPending,
  };
};
