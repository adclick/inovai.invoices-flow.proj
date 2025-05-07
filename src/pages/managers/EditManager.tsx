import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import EditPageLayout from "@/components/common/EditPageLayout";
import FormActions from "@/components/common/FormActions";
import ActiveSwitchField from "@/components/common/ActiveSwitchField";

// Zod schema type will be inferred by the component
let managerFormSchema: z.ZodObject<any>; 

type ManagerFormValues = z.infer<typeof managerFormSchema>;

const EditManager = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Define form validation schema inside the component
  managerFormSchema = z.object({
    name: z.string().min(1, t("managers.managerName") + " " + t("common.isRequired")).max(100, t("managers.managerName") + " " + t("common.maxLength", { count: 100 })),
    email: z.string().email(t("common.validEmail")).min(1, t("common.email") + " " + t("common.isRequired")),
    active: z.boolean().default(true),
  });

  // Initialize form
  const form = useForm<ManagerFormValues>({
    resolver: zodResolver(managerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      active: true,
    },
  });

  // Fetch manager data
  const { data: manager, isLoading, isError } = useQuery({
    queryKey: ["manager", id],
    queryFn: async () => {
      if (!id) throw new Error("Manager ID is required");

      const { data, error } = await supabase
        .from("managers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching manager:", error.message);
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!id,
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

  // Update manager mutation
  const updateManagerMutation = useMutation({
    mutationFn: async (values: ManagerFormValues) => {
      if (!id) throw new Error("Manager ID is required");

      const { data, error } = await supabase
        .from("managers")
        .update({
          name: values.name,
          email: values.email,
          active: values.active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating manager:", error.message);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managers"] });
      queryClient.invalidateQueries({ queryKey: ["manager", id] });
      toast({
        title: t("managers.managerUpdated"),
        description: t("managers.managerUpdatedDescription"),
      });
      navigate("/managers");
    },
    onError: (error: Error) => {
      console.error("Mutation error:", error.message);
      toast({
        title: t("common.error"),
        description: t("managers.managerUpdateError"),
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (values: ManagerFormValues) => {
    updateManagerMutation.mutate(values);
  };

  return (
    <EditPageLayout
      title={t("managers.editManager")}
      description={t("managers.updateManagerInfo")}
      isLoading={isLoading}
      isError={isError || (!isLoading && !manager)}
      loadingText={t("managers.loadingManagerData")}
      errorText={t("managers.errorLoadingManagerData")}
      backPath="/managers"
      backButtonText={t("managers.backToManagers")}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("managers.managerName")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("managers.enterManagerName")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("common.email")}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder={t("managers.enterManagerEmail")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <ActiveSwitchField
            control={form.control}
            name="active"
            label={t("managers.activeManager")}
            description={t("managers.markAsActive")}
          />

          <FormActions
            onCancel={() => navigate("/managers")}
            isSaving={updateManagerMutation.isPending}
            backButton={{
              text: t("managers.backToManagers"),
              onClick: () => navigate("/managers"),
            }}
          />
        </form>
      </Form>
    </EditPageLayout>
  );
};

export default EditManager;

