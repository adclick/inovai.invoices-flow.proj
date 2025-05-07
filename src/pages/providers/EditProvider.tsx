import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EditPageLayout from "@/components/common/EditPageLayout";
import FormActions from "@/components/common/FormActions";
import ActiveSwitchField from "@/components/common/ActiveSwitchField";

const LANGUAGES = [
	{ value: "en", labelKey: "common.english" },
	{ value: "pt", labelKey: "common.portuguese" },
	{ value: "es", labelKey: "common.spanish" },
] as const;

type LanguageValue = typeof LANGUAGES[number]["value"];

const isValidLanguage = (lang: unknown): lang is LanguageValue =>
	LANGUAGES.map(l => l.value).includes(lang as LanguageValue);

let providerSchema: z.ZodObject<any>;
type ProviderFormValues = z.infer<typeof providerSchema>;

const EditProvider = () => {
	const { t } = useTranslation();
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	// Schema for provider form validation
	providerSchema = z.object({
		name: z.string().min(2, t("common.nameMinLength", { count: 2 })),
		email: z.string().email(t("common.validEmail")),
		country: z.string().optional(),
		iban: z.string().optional(),
		active: z.boolean().default(true),
		language: z.enum(LANGUAGES.map(l => l.value) as [LanguageValue, ...LanguageValue[]]).optional(),
	});

	// Fetch provider details
	const { data: provider, isLoading: isLoadingProvider, isError } = useQuery({
		queryKey: ["provider", id],
		queryFn: async () => {
			if (!id) throw new Error("Provider ID is required");

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
		enabled: !!id,
	});

	// Form setup
	const form = useForm<ProviderFormValues>({
		resolver: zodResolver(providerSchema),
		defaultValues: {
			name: "",
			email: "",
			country: "",
			iban: "",
			active: true,
			language: undefined,
		},
	});

	// Update form values when provider data is loaded
	useEffect(() => {
		if (provider) {
			const languageValue = isValidLanguage(provider.language)
				? provider.language
				: undefined;

			form.reset({
				name: provider.name,
				email: provider.email,
				country: provider.country || "",
				iban: provider.iban || "",
				active: provider.active,
				language: languageValue,
			});
		}
	}, [provider, form]);

	const updateProvider = useMutation({
		mutationFn: async (values: ProviderFormValues) => {
			if (!id) throw new Error("Provider ID is required");

			const { data, error } = await supabase
				.from("providers")
				.update({
					name: values.name,
					email: values.email,
					country: values.country || null,
					iban: values.iban || null,
					active: values.active,
					language: values.language || null,
				})
				.eq("id", id)
				.select("id")
				.single();

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
				title: t("providers.providerUpdated"),
				description: t("providers.providerUpdatedDescription"),
			});
			navigate("/providers");
		},
		onError: (error: Error) => {
      console.error("Mutation error:", error.message);
			toast({
				title: t("common.error"),
				description: t("providers.providerUpdateError"),
				variant: "destructive",
			});
		},
	});

	const onSubmit = (values: ProviderFormValues) => {
		updateProvider.mutate(values);
	};

	return (
    <EditPageLayout
      title={t("providers.editProvider")}
      description={t("providers.updateProviderDescription")}
      isLoading={isLoadingProvider}
      isError={isError || (!isLoadingProvider && !provider)}
      loadingText={t("common.loading")}
      errorText={t("providers.providerNotFound")}
      backPath="/providers"
      backButtonText={t("providers.backToProviders")}
    >
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
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("common.language")}</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("providers.selectLanguage")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {LANGUAGES.map(({ value, labelKey }) => (
                            <SelectItem key={value} value={value}>
                              {t(labelKey)}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
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
                      value={field.value || ""} // Ensure value is not null for input
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <ActiveSwitchField
            control={form.control}
            name="active"
            label={t("providers.active")}
            description={t("providers.activeDescription")}
          />

          <FormActions
            onCancel={() => navigate("/providers")}
            isSaving={updateProvider.isPending}
            saveText={t("providers.updateProvider")}
            savingText={t("common.updating")}
            backButton={{
              text: t("providers.backToProviders"),
              onClick: () => navigate("/providers"),
            }}
          />
        </form>
      </Form>
    </EditPageLayout>
  );
};

export default EditProvider;

