import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import JobTypeModal from "@/components/jobs_types/JobTypeModal";
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
import { Database } from "@/integrations/supabase/types";

type JobType = Database["public"]["Tables"]["job_type"]["Row"];

const JobsTypesList: React.FC = () => {
  const { t } = useTranslation();
  const { openModal } = useModalState();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobTypeToDelete, setJobTypeToDelete] = useState<JobType | null>(null);

  // Fetch job types
  const { data: jobTypes, isLoading, isError } = useQuery({
    queryKey: ["jobTypes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_type")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching job types:", error.message);
        throw error;
      }
      return data as JobType[];
    },
  });

  const deleteJobTypeMutation = useMutation({
    mutationFn: async (jobTypeId: string) => {
      const { error } = await supabase
        .from("job_type")
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

  // Handler to open the create job type modal
  const handleCreateJobType = () => {
    openModal('jobType', 'create');
  };

  // Handler to open the edit job type modal
  const handleEditJobType = (id: string) => {
    openModal('jobType', 'edit', id);
  };

  const handleDeleteJobType = (jobType: JobType) => {
    setJobTypeToDelete(jobType);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (jobTypeToDelete) {
      deleteJobTypeMutation.mutate(jobTypeToDelete.id);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <DashboardHeader 
            title={t("jobTypes.title")} 
            showCreateButton
            createButtonText={t("jobTypes.createNew")}
            createButtonAction={handleCreateJobType}
          />
          <div className="flex justify-center items-center h-64">
            <p>{t("jobTypes.loadingJobTypes")}</p>
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
            title={t("jobTypes.title")} 
            showCreateButton
            createButtonText={t("jobTypes.createNew")}
            createButtonAction={handleCreateJobType}
          />
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">{t("jobTypes.errorLoadingJobTypes")}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t("jobTypes.title")}</h1>
          <Button onClick={handleCreateJobType}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("jobTypes.createNew")}
          </Button>
        </div>

        {jobTypes && jobTypes.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("jobTypes.name")}</TableHead>
                  <TableHead className="w-[120px] text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobTypes.map((jobType) => (
                  <TableRow 
                    key={jobType.id} 
                    onClick={() => handleEditJobType(jobType.id)} 
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">
                      {jobType.name}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => { e.stopPropagation(); handleDeleteJobType(jobType); }}
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
            <p className="text-slate-500 dark:text-slate-400 mb-4">{t("jobTypes.noData")}</p>
            <Button onClick={handleCreateJobType}>
              {t("jobTypes.createFirstJobType")}
            </Button>
          </div>
        )}
      </div>
      <JobTypeModal />
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("jobTypes.deleteJobType")}</DialogTitle>
            <DialogDescription>
              {t("jobTypes.deleteConfirmation", { name: jobTypeToDelete?.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteJobTypeMutation.isPending}
            >
              {deleteJobTypeMutation.isPending ? t("jobTypes.deleting") : t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default JobsTypesList;
