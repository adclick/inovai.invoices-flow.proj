
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import * as z from "zod";
import { useEntityQuery } from "@/hooks/useEntityQuery";
import { useEntityMutation } from "@/hooks/useEntityMutation";
import { BaseEntityFormProps } from "@/components/common/EntityModal";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import RequiredTextField from "@/components/common/form/RequiredTextField";

const jobTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type JobTypeFormData = z.infer<typeof jobTypeSchema>;

const JobTypeForm: React.FC<BaseEntityFormProps> = ({
  onClose,
  onSuccess,
  id,
  mode,
}) => {
  const { t } = useTranslation();
  const isEdit = mode === "edit";

  const form = useForm<JobTypeFormData>({
    resolver: zodResolver(jobTypeSchema),
    defaultValues: {
      name: "",
    },
  });

  // Fetch job type data if in edit mode
  const { data: jobType } = useEntityQuery({
    tableName: "job_types",
    entityName: "jobType",
    id,
    enabled: isEdit && !!id,
  });

  // Update form when job type data is loaded
  React.useEffect(() => {
    if (jobType && isEdit && typeof jobType === 'object' && 'name' in jobType) {
      form.reset({
        name: (jobType.name as string) || "",
      });
    }
  }, [jobType, isEdit, form]);

  const { createMutation, updateMutation } = useEntityMutation({
    tableName: "job_types",
    entityName: "jobTypes",
    queryKey: "jobTypes",
    onSuccess,
    onClose,
  });

  const onSubmit = (values: JobTypeFormData) => {
    if (isEdit && id) {
      updateMutation.mutate({ id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <RequiredTextField
          control={form.control}
          name="name"
          label={t("jobTypes.name")}
          placeholder={t("jobTypes.namePlaceholder")}
          disabled={isLoading}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
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
        </div>
      </form>
    </Form>
  );
};

export default JobTypeForm;
