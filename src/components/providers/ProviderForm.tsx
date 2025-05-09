
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ActiveSwitchField from "@/components/common/ActiveSwitchField";
import { BaseEntityFormProps } from "../common/EntityModal";

interface ProviderFormProps extends BaseEntityFormProps {}

const ProviderForm: React.FC<ProviderFormProps> = ({
  onClose,
  onSuccess,
  id,
  mode,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
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
  const { data: provider, isLoading } = useQuery({
    queryKey: ["provider", id],
    queryFn: async () => {
      if (!id) throw new Error("Provider ID is required for edit mode");

      const { data, error } = await supabase
        .from("providers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching provider:", error.message);
        throw error;
      }
      return data;
    },
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

  // Create provider mutation
  const createMutation = useMutation({
    mutationFn: async (values: ProviderFormValues) => {
      // Ensure required fields are not undefined
      const safeValues = {
        name: values.name,
        email: values.email,
        language: values.language,
        country: values.country || null,
        iban: values.iban || null,
        active: values.active,
      };
      
      const { data, error } = await supabase
        .from("providers")
        .insert(safeValues)
        .select();

      if (error) {
        console.error("Error creating provider:", error.message);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      toast({
        title: t("providers.created"),
      });
      form.reset();
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: String(error),
        variant: "destructive",
      });
    },
  });

  // Update provider mutation
  const updateMutation = useMutation({
    mutationFn: async (values: ProviderFormValues) => {
      if (!id) throw new Error("Provider ID is required for update");

      // Ensure required fields are not undefined
      const safeValues = {
        name: values.name,
        email: values.email,
        language: values.language,
        country: values.country || null,
        iban: values.iban || null,
        active: values.active,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("providers")
        .update(safeValues)
        .eq("id", id)
        .select();

      if (error) {
        console.error("Error updating provider:", error.message);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      queryClient.invalidateQueries({ queryKey: ["provider", id] });
      toast({
        title: t("providers.updated"),
      });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: String(error),
        variant: "destructive",
      });
    },
  });

  // Combined mutation for both create and update
  const mutation = isEditMode ? updateMutation : createMutation;
  const isPending = mutation.isPending || isLoading;

  // Form submission handler
  const onSubmit = (values: ProviderFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("providers.name")}</FormLabel>
              <FormControl>
                <Input placeholder={t("providers.enterName")} {...field} />
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
                <Input
                  type="email"
                  placeholder={t("common.enterEmail")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("providers.preferredLanguage")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("providers.selectLanguage")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pt">{t("languages.portuguese")}</SelectItem>
                  <SelectItem value="en">{t("languages.english")}</SelectItem>
                  <SelectItem value="es">{t("languages.spanish")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

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
              ? t("common.update")
              : t("common.create")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProviderForm;
