
import React from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BaseEntityFormProps } from "../common/EntityModal";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useEntityMutation } from "@/hooks/useEntityMutation";
import { useEntityQuery } from "@/hooks/useEntityQuery";
import RequiredTextField from "@/components/common/form/RequiredTextField";
import ActiveSwitchField from "../common/ActiveSwitchField";

const companySchema = z.object({
  name: z.string().min(1, "companies.nameRequired"),
  active: z.boolean(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

const CompanyForm: React.FC<BaseEntityFormProps> = ({
  id,
  mode,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation();
  const isEditMode = mode === "edit";

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      active: true,
    },
  });

  const { isLoading: companyLoading } = useEntityQuery({
    tableName: "companies",
    entityName: "company",
    id,
    enabled: isEditMode && !!id,
    select: "*",
  });

  React.useEffect(() => {
    if (isEditMode && id) {
      const loadCompany = async () => {
        try {
          const { supabase } = await import("@/integrations/supabase/client");
          const { data: companyData } = await supabase
            .from("companies")
            .select("*")
            .eq("id", id)
            .single();
          
          if (companyData) {
            form.reset({
              name: companyData.name,
              active: companyData.active,
            });
          }
        } catch (error) {
          console.error("Error loading company:", error);
        }
      };
      loadCompany();
    }
  }, [isEditMode, id, form]);

  const { createMutation, updateMutation } = useEntityMutation({
    tableName: "companies",
    entityName: "companies",
    queryKey: "companies",
    onSuccess,
    onClose,
  });

  const onSubmit = (values: CompanyFormValues) => {
    const submitData = {
      name: values.name,
      active: values.active,
    };

    if (isEditMode && id) {
      updateMutation.mutate({ id, values: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending || companyLoading;
  const isReadOnly = mode === "view";

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information Section */}
          <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl border-2 border-slate-200 dark:border-slate-600 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <div className="w-2 h-6 bg-gradient-to-b from-brand to-brand-light rounded-full"></div>
              {t("companies.basicInformation")}
            </h3>
            <RequiredTextField
              control={form.control}
              name="name"
              label={t("companies.name")}
              placeholder={t("companies.enterName")}
              disabled={isReadOnly}
            />
          </div>

          {/* Status Section */}
          <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl border-2 border-slate-200 dark:border-slate-600 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <div className="w-2 h-6 bg-gradient-to-b from-brand to-brand-light rounded-full"></div>
              {t("common.status")}
            </h3>
            <ActiveSwitchField
              control={form.control}
              name="active"
              label={t("common.active")}
              description={t("companies.activeDescription")}
            />
          </div>

          {/* Action Buttons */}
          {!isReadOnly && (
            <div className="sticky bottom-0 z-10 bg-white dark:bg-slate-900 p-6 border-t-2 border-slate-200 dark:border-slate-600 -mx-6 -mb-6 rounded-b-xl bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={onClose} size="lg">
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={isSubmitting} size="lg">
                  {isSubmitting
                    ? isEditMode
                      ? t("common.updating")
                      : t("common.creating")
                    : isEditMode
                    ? t("common.save")
                    : t("common.create")}
                </Button>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default CompanyForm;
