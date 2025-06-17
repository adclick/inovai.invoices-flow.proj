
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
    if (manager && typeof manager === 'object' && manager !== null && 'name' in manager) {
      const managerData = manager as any;
      form.reset({
        name: managerData.name as string,
        email: managerData.email as string,
        active: managerData.active as boolean,
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
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information Section */}
          <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl border-2 border-slate-200 dark:border-slate-600 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <div className="w-2 h-6 bg-gradient-to-b from-brand to-brand-light rounded-full"></div>
              {t("managers.basicInformation")}
            </h3>
            <div className="space-y-6">
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
            </div>
          </div>

          {/* Status Section */}
          {isEditMode && (
            <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl border-2 border-slate-200 dark:border-slate-600 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-brand to-brand-light rounded-full"></div>
                {t("common.status")}
              </h3>
              <ActiveSwitchField
                control={form.control}
                name="active"
                description={t("managers.activeDescription")}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="sticky bottom-0 z-10 bg-white dark:bg-slate-900 p-6 border-t-2 border-slate-200 dark:border-slate-600 -mx-6 -mb-6 rounded-b-xl bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose} size="lg">
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isPending} size="lg">
                {isPending 
                  ? isEditMode 
                    ? t("common.updating") 
                    : t("common.creating") 
                  : isEditMode 
                    ? t("common.save") 
                    : t("common.create")}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ManagerForm;
