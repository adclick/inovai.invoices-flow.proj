
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import RequiredTextField from "@/components/common/form/RequiredTextField";
import ActiveSwitchField from "@/components/common/ActiveSwitchField";
import { BaseEntityFormProps } from "../common/EntityModal";
import { useEntityMutation } from "@/hooks/useEntityMutation";
import { useEntityQuery } from "@/hooks/useEntityQuery";

const ManagerForm: React.FC<BaseEntityFormProps> = ({ 
  onClose, 
  onSuccess, 
  id, 
  mode 
}) => {
  const { t } = useTranslation();
  const isEditMode = mode === 'edit';

  // Schema for manager form validation
  const managerSchema = z.object({
    name: z.string().min(1, t("managers.nameRequired")),
    email: z.string().email(t("common.invalidEmail")),
    active: z.boolean().default(true),
  });

  type ManagerFormValues = z.infer<typeof managerSchema>;

  // Form setup
  const form = useForm<ManagerFormValues>({
    resolver: zodResolver(managerSchema),
    defaultValues: {
      name: "",
      email: "",
      active: true,
    },
  });

  // Fetch manager data if in edit mode
  const { data: manager, isLoading } = useEntityQuery({
    tableName: "managers",
    entityName: "manager",
    id,
    enabled: isEditMode && Boolean(id),
  });

  // Update form values when manager data is loaded
  useEffect(() => {
    if (manager) {
      form.reset({
        name: manager.name,
        email: manager.email,
        active: manager.active,
      });
    }
  }, [manager, form]);

  // Mutations
  const { createMutation, updateMutation } = useEntityMutation({
    tableName: "managers",
    entityName: "managers",
    queryKey: "managers",
    onSuccess,
    onClose,
  });

  const mutation = isEditMode ? updateMutation : createMutation;
  const isPending = mutation.isPending || isLoading;

  // Form submission handler
  const onSubmit = (values: ManagerFormValues) => {
    if (isEditMode && id) {
      updateMutation.mutate({ id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <RequiredTextField
          control={form.control}
          name="name"
          label={t("managers.name")}
          placeholder={t("managers.enterName")}
        />

        <RequiredTextField
          control={form.control}
          name="email"
          label={t("common.email")}
          placeholder={t("common.enterEmail")}
          type="email"
        />

        {isEditMode && (
          <ActiveSwitchField
            control={form.control}
            name="active"
            description={t("managers.activeDescription")}
          />
        )}

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending 
              ? isEditMode 
                ? t("common.updating") 
                : t("common.creating") 
              : isEditMode 
                ? t("common.save") 
                : t("common.create")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ManagerForm;
