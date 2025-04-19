
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Switch,
} from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

// Define form validation schema
const managerFormSchema = z.object({
  name: z.string().min(1, "Manager name is required").max(100, "Manager name must be less than 100 characters"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  active: z.boolean().default(true),
});

type ManagerFormValues = z.infer<typeof managerFormSchema>;

const EditManager = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
        .select();

      if (error) {
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
    onError: () => {
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate("/managers")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("managers.backToManagers")}
            </Button>
          </div>
          <div className="flex justify-center items-center h-64">
            <p>{t("managers.loadingManagerData")}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !manager) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate("/managers")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("managers.backToManagers")}
            </Button>
          </div>
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">{t("managers.errorLoadingManagerData")}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{t("managers.editManager")}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {t("managers.updateManagerDescription")}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
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
                    <FormLabel>{t("managers.email")}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={t("managers.enterManagerEmail")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm">{t("managers.activeManager")}</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        {t("managers.markAsActive")}
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => navigate("/managers")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("managers.backToManagers")}
                </Button>
                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => navigate("/managers")}>
                    {t("common.cancel")}
                  </Button>
                  <Button type="submit" disabled={updateManagerMutation.isPending}>
                    {updateManagerMutation.isPending ? t("managers.saving") : t("managers.saveChanges")}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditManager;

