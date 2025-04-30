import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useTranslation } from "react-i18next";

const CreateProvider = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

	// Schema for provider form validation
const providerSchema = z.object({
  name: z.string().min(2, t("common.nameMinLength")),
  email: z.string().email(t("common.validEmail")),
  country: z.string().optional(),
  iban: z.string().optional(),
  active: z.boolean().default(true),
}).required();

type ProviderFormValues = z.infer<typeof providerSchema>;

  // Form setup
  const form = useForm<ProviderFormValues>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      name: "",
      email: "",
      country: "",
      iban: "",
      active: true,
    },
  });

  // Create provider mutation
  const createProvider = useMutation({
    mutationFn: async (values: ProviderFormValues) => {
      const { data, error } = await supabase
        .from("providers")
        .insert({
          name: values.name,
          email: values.email,
          country: values.country || null,
          iban: values.iban || null,
          active: values.active
        })
        .select("id")
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      toast({
        title: t("providers.providerCreated"),
        description: t("providers.providerCreatedDescription"),
      });
      navigate("/providers");
    },
    onError: (error) => {
      console.error("Error creating provider:", error);
      toast({
        title: t("common.error"),
        description: t("providers.providerCreateError"),
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (values: ProviderFormValues) => {
    createProvider.mutate(values);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{t("providers.createNew")}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {t("providers.createProviderDescription")}
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
                    <FormLabel>{t("providers.providerName")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("providers.enterProviderName")} {...field} />
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
                      <Input type="email" placeholder={t("providers.enterEmail")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("providers.country")}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t("providers.enterCountry")}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="iban"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("providers.iban")}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t("providers.enterIban")}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 border-slate-200 dark:border-slate-700">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{t("providers.active")}</FormLabel>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t("providers.activeDescription")}
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/providers")}
                >
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={createProvider.isPending}>
                  {createProvider.isPending ? t("common.creating") : t("providers.createNew")}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateProvider;
