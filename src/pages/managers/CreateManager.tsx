
import React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

const CreateManager = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Define form validation schema
  const managerFormSchema = z.object({
    name: z.string().min(1, t("managers.managerName") + " " + t("common.error")).max(100, t("managers.managerName") + " " + t("common.error")),
    email: z.string().email(t("common.error")).min(1, t("common.email") + " " + t("common.error")),
  });

  type ManagerFormValues = z.infer<typeof managerFormSchema>;

  // Initialize form
  const form = useForm<ManagerFormValues>({
    resolver: zodResolver(managerFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  // Create manager mutation
  const createManagerMutation = useMutation({
    mutationFn: async (values: ManagerFormValues) => {
      const { data, error } = await supabase
        .from("managers")
        .insert({ 
          name: values.name, 
          email: values.email 
        })
        .select();

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managers"] });
      toast({
        title: t("managers.managerCreated"),
      });
      navigate("/managers");
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: `${t("managers.managerCreated")}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (values: ManagerFormValues) => {
    createManagerMutation.mutate(values);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{t("managers.createNew")}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {t("managers.managerDetails")}
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
                      <Input placeholder={t("managers.managerName")} {...field} />
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
                      <Input 
                        type="email" 
                        placeholder={t("managers.email")}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/managers")}
                >
                  {t("common.cancel")}
                </Button>
                <Button 
                  type="submit" 
                  disabled={createManagerMutation.isPending}
                >
                  {createManagerMutation.isPending ? t("common.creating") : t("managers.createNew")}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateManager;
