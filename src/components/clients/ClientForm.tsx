
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
    if (client && typeof client === 'object' && 'name' in client) {
      form.reset({
        name: client.name,
        active: client.active,
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <RequiredTextField
          control={form.control}
          name="name"
          label={t("clients.clientName")}
          placeholder={t("clients.enterName")}
        />

        {isEditMode && (
          <ActiveSwitchField
            control={form.control}
            name="active"
            description={t("clients.activeDescription")}
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

export default ClientForm;
