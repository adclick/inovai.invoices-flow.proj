
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
    if (provider && typeof provider === 'object' && provider !== null && 'name' in provider) {
      const providerData = provider as any;
      form.reset({
        name: providerData.name as string,
        email: providerData.email as string,
        language: providerData.language as "pt" | "en" | "es",
        country: (providerData.country as string) || "",
        iban: (providerData.iban as string) || "",
        active: providerData.active as boolean,
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

  // Form submission handlers
  const handleSave = (values: ProviderFormValues) => {
    const safeValues = {
      name: values.name,
      email: values.email,
      language: values.language,
      country: values.country || null,
      iban: values.iban || null,
      active: values.active,
    };

    if (isEditMode && id) {
      updateMutation.mutate({ id, values: safeValues, shouldClose: false });
    } else {
      createMutation.mutate({ values: safeValues, shouldClose: false });
    }
  };

  const handleSaveAndClose = (values: ProviderFormValues) => {
    const safeValues = {
      name: values.name,
      email: values.email,
      language: values.language,
      country: values.country || null,
      iban: values.iban || null,
      active: values.active,
    };

    if (isEditMode && id) {
      updateMutation.mutate({ id, values: safeValues, shouldClose: true });
    } else {
      createMutation.mutate({ values: safeValues, shouldClose: true });
    }
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form className="space-y-8">
          {/* Basic Information Section */}
          <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl border-2 border-slate-200 dark:border-slate-600 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <div className="w-2 h-6 bg-gradient-to-b from-primary to-sidebar-accent rounded-full"></div>
              {t("providers.basicInformation")}
            </h3>
            <div className="space-y-6">
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
            </div>
          </div>

          {/* Status Section */}
          {isEditMode && (
            <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl border-2 border-slate-200 dark:border-slate-600 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-primary to-sidebar-accent rounded-full"></div>
                {t("common.status")}
              </h3>
              <ActiveSwitchField
                control={form.control}
                name="active"
                description={t("providers.activeDescription")}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="sticky bottom-0 z-10 bg-white dark:bg-slate-900 p-6 border-t-2 border-slate-200 dark:border-slate-600 -mx-6 -mb-6 rounded-b-xl bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose} size="lg">
                {t("common.cancel")}
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={form.handleSubmit(handleSave)} 
                disabled={isPending} 
                size="lg"
              >
                {isPending
                  ? isEditMode
                    ? t("common.updating")
                    : t("common.creating")
                  : t("common.save")}
              </Button>
              <Button 
                type="button" 
                onClick={form.handleSubmit(handleSaveAndClose)} 
                disabled={isPending} 
                size="lg"
              >
                {isPending
                  ? isEditMode
                    ? t("common.updating")
                    : t("common.creating")
                  : t("common.saveAndClose")}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProviderForm;
