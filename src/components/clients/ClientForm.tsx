
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

const ClientForm: React.FC<BaseEntityFormProps> = ({
  onClose,
  onSuccess,
  id,
  mode,
}) => {
  const { t } = useTranslation();
  const isEditMode = mode === 'edit';

  // Schema for client form validation
  const clientSchema = z.object({
    name: z.string().min(1, t("clients.nameRequired")),
    active: z.boolean().default(true),
  });

  type ClientFormValues = z.infer<typeof clientSchema>;

  // Form setup
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      active: true,
    },
  });

  // Fetch client data if in edit mode
  const { data: client, isLoading } = useEntityQuery({
    tableName: "clients",
    entityName: "client",
    id,
    enabled: isEditMode && Boolean(id),
  });

  // Update form values when client data is loaded
  useEffect(() => {
    if (client && typeof client === 'object' && client !== null && 'name' in client) {
      const clientData = client as any;
      form.reset({
        name: clientData.name as string,
        active: clientData.active as boolean,
      });
    }
  }, [client, form]);

  // Mutations
  const { createMutation, updateMutation } = useEntityMutation({
    tableName: "clients",
    entityName: "clients",
    queryKey: "clients",
    onSuccess,
    onClose,
  });

  const mutation = isEditMode ? updateMutation : createMutation;
  const isPending = mutation.isPending || isLoading;

  // Form submission handler
  const onSubmit = (values: ClientFormValues) => {
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
              {t("clients.basicInformation")}
            </h3>
            <RequiredTextField
              control={form.control}
              name="name"
              label={t("clients.clientName")}
              placeholder={t("clients.enterName")}
            />
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
                description={t("clients.activeDescription")}
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

export default ClientForm;
