
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import RequiredTextField from "@/components/common/form/RequiredTextField";
import OptionalSelectField from "@/components/common/form/OptionalSelectField";
import ActiveSwitchField from "@/components/common/ActiveSwitchField";
import { BaseEntityFormProps } from "../common/EntityModal";
import { useEntityMutation } from "@/hooks/useEntityMutation";
import { useEntityQuery } from "@/hooks/useEntityQuery";
import { LANGUAGE_OPTIONS } from "@/utils/formConstants";

const ProviderForm: React.FC<BaseEntityFormProps> = ({
  onClose,
  onSuccess,
  id,
  mode,
}) => {
  const { t } = useTranslation();
  const isEditMode = mode === 'edit';

  // Schema for provider form validation
  const providerSchema = z.object({
    name: z.string().min(1, t("providers.nameRequired")),
    email: z.string().email(t("common.invalidEmail")),
    language: z.enum(["pt", "en", "es"]).default("pt"),
    country: z.string().optional(),
    iban: z.string().optional(),
    active: z.boolean().default(true),
  });

  type ProviderFormValues = z.infer<typeof providerSchema>;

  // Form setup
  const form = useForm<ProviderFormValues>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      name: "",
      email: "",
      language: "pt",
      country: "",
      iban: "",
      active: true,
    },
  });

  // Fetch provider data if in edit mode
  const { data: provider, isLoading } = useEntityQuery({
    tableName: "providers",
    entityName: "provider",
    id,
    enabled: isEditMode && Boolean(id),
  });

  // Update form values when provider data is loaded
  useEffect(() => {
    if (provider) {
      form.reset({
        name: provider.name,
        email: provider.email,
        language: provider.language,
        country: provider.country || "",
        iban: provider.iban || "",
        active: provider.active,
      });
    }
  }, [provider, form]);

  // Mutations
  const { createMutation, updateMutation } = useEntityMutation({
    tableName: "providers",
    entityName: "providers",
    queryKey: "providers",
    onSuccess,
    onClose,
  });

  const mutation = isEditMode ? updateMutation : createMutation;
  const isPending = mutation.isPending || isLoading;

  // Form submission handler
  const onSubmit = (values: ProviderFormValues) => {
    const safeValues = {
      name: values.name,
      email: values.email,
      language: values.language,
      country: values.country || null,
      iban: values.iban || null,
      active: values.active,
    };

    if (isEditMode && id) {
      updateMutation.mutate({ id, values: safeValues });
    } else {
      createMutation.mutate(safeValues);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <RequiredTextField
          control={form.control}
          name="name"
          label={t("providers.name")}
          placeholder={t("providers.enterName")}
        />

        <RequiredTextField
          control={form.control}
          name="email"
          label={t("common.email")}
          placeholder={t("common.enterEmail")}
          type="email"
        />

        <OptionalSelectField
          control={form.control}
          name="language"
          label={t("providers.language")}
          placeholder={t("providers.language")}
          options={LANGUAGE_OPTIONS}
          t={t}
        />

        <RequiredTextField
          control={form.control}
          name="country"
          label={t("providers.country")}
          placeholder={t("providers.enterCountry")}
        />

        <RequiredTextField
          control={form.control}
          name="iban"
          label={t("providers.iban")}
          placeholder={t("providers.enterIban")}
        />

        {isEditMode && (
          <ActiveSwitchField
            control={form.control}
            name="active"
            description={t("providers.activeDescription")}
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

export default ProviderForm;
