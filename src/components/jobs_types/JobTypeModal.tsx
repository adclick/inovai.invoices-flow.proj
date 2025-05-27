import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useModalState } from "@/hooks/useModalState";
import { useToast } from "@/hooks/use-toast";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Database } from "@/integrations/supabase/types";

type JobType = Database["public"]["Tables"]["job_types"]["Row"];

interface JobTypeFormData {
  name: string;
}

const JobTypeModal: React.FC = () => {
  const { t } = useTranslation();
  const { modalState, closeModal } = useModalState();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<JobTypeFormData>({
    defaultValues: {
      name: "",
    },
  });

  // Fetch job type data if in edit mode
  const { data: jobType } = useQuery({
    queryKey: ["jobType", modalState.id],
    queryFn: async () => {
      if (!modalState.id) return null;
      const { data, error } = await supabase
        .from("job_types")
        .select("*")
        .eq("id", modalState.id)
        .single();

      if (error) throw error;
      return data as JobType;
    },
    enabled: modalState.mode === "edit" && !!modalState.id,
  });

  // Update form when job type data is loaded
  React.useEffect(() => {
    if (jobType) {
      form.reset({
        name: jobType.name,
      });
    }
  }, [jobType, form]);

  const createJobTypeMutation = useMutation({
    mutationFn: async (data: JobTypeFormData) => {
      const { error } = await supabase.from("job_types").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobTypes"] });
      toast({
        title: t("jobTypes.jobTypeCreated"),
        description: t("jobTypes.jobTypeCreatedDescription"),
      });
      closeModal();
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: t("jobTypes.jobTypeCreateError"),
        variant: "destructive",
      });
    },
  });

  const updateJobTypeMutation = useMutation({
    mutationFn: async (data: JobTypeFormData) => {
      if (!modalState.id) throw new Error("No job type ID provided");
      const { error } = await supabase
        .from("job_type")
        .update(data)
        .eq("id", modalState.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobTypes"] });
      toast({
        title: t("jobTypes.jobTypeUpdated"),
        description: t("jobTypes.jobTypeUpdatedDescription"),
      });
      closeModal();
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: t("jobTypes.jobTypeUpdateError"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: JobTypeFormData) => {
    if (modalState.mode === "create") {
      createJobTypeMutation.mutate(data);
    } else {
      updateJobTypeMutation.mutate(data);
    }
  };

  const isOpen = modalState.isOpen && modalState.type === "jobType";
  const isEdit = modalState.mode === "edit";
  const isLoading = createJobTypeMutation.isPending || updateJobTypeMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("jobTypes.editJobType") : t("jobTypes.createJobType")}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t("jobTypes.editJobTypeDescription")
              : t("jobTypes.createJobTypeDescription")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("jobTypes.name")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                disabled={isLoading}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? isEdit
                    ? t("jobTypes.updating")
                    : t("jobTypes.creating")
                  : isEdit
                  ? t("common.save")
                  : t("common.create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default JobTypeModal; 