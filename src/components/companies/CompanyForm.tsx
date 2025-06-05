
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
import { ActiveSwitchField } from "@/components/common/ActiveSwitchField";

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
          const { data: supabase } = await import("@/integrations/supabase/client");
          const { data: companyData } = await supabase.supabase
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <RequiredTextField
          control={form.control}
          name="name"
          label={t("companies.name")}
          placeholder={t("companies.enterName")}
          disabled={isReadOnly}
        />

        <ActiveSwitchField
          control={form.control}
          name="active"
          label={t("common.active")}
          description={t("companies.activeDescription")}
          disabled={isReadOnly}
        />

        <div className="sticky bottom-0 z-10 bg-card p-4 border-t border-border flex justify-between items-center">
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("common.back")}
          </Button>
          {!isReadOnly && (
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? isEditMode
                    ? t("common.updating")
                    : t("common.creating")
                  : isEditMode
                  ? t("common.save")
                  : t("common.create")}
              </Button>
            </div>
          )}
        </div>
      </form>
    </Form>
  );
};

export default CompanyForm;
