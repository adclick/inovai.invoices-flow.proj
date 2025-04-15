
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

const CreateClient = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Define form validation schema
  const clientFormSchema = z.object({
    name: z.string().min(1, t("clients.clientName") + " " + t("common.error")).max(100, t("clients.clientName") + " " + t("common.error")),
  });

  type ClientFormValues = z.infer<typeof clientFormSchema>;

  // Initialize form
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
    },
  });

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: async (values: ClientFormValues) => {
      const { data, error } = await supabase
        .from("clients")
        .insert([{ name: values.name }])
        .select();

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({
        title: t("clients.clientCreated"),
      });
      navigate("/clients");
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: `${t("clients.clientCreated")}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (values: ClientFormValues) => {
    createClientMutation.mutate(values);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{t("clients.createNew")}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {t("clients.clientDetails")}
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
                    <FormLabel>{t("clients.clientName")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("clients.clientName")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/clients")}
                >
                  {t("common.cancel")}
                </Button>
                <Button 
                  type="submit" 
                  disabled={createClientMutation.isPending}
                >
                  {createClientMutation.isPending ? t("common.creating") : t("clients.createNew")}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateClient;
