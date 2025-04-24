import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "react-i18next";

// Schema for job form validation
const jobSchema = z.object({
  campaign_id: z.string().min(1, "Please select a campaign"),
  provider_id: z.string().min(1, "Please select a provider"),
  manager_id: z.string().min(1, "Please select a manager"),
  value: z.coerce.number().min(0, "Value must be at least 0"),
  currency: z.string().min(1, "Please select a currency"),
  status: z.string().min(1, "Please select a status"),
  paid: z.boolean().default(false),
  manager_ok: z.boolean().default(false),
  months: z.array(z.string()).min(1, "Please select at least one month"),
  due_date: z.string().optional(),
  public_notes: z.string().optional(),
  private_notes: z.string().optional(),
});

type JobFormValues = z.infer<typeof jobSchema>;

const months = [
  { value: "january", label: "January" },
  { value: "february", label: "February" },
  { value: "march", label: "March" },
  { value: "april", label: "April" },
  { value: "may", label: "May" },
  { value: "june", label: "June" },
  { value: "july", label: "July" },
  { value: "august", label: "August" },
  { value: "september", label: "September" },
  { value: "october", label: "October" },
  { value: "november", label: "November" },
  { value: "december", label: "December" },
];

const currencyOptions = [
  { value: "euro", label: "Euro (€)" },
  { value: "usd", label: "US Dollar ($)" },
  { value: "gbp", label: "British Pound (£)" },
];

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "pending_invoice", label: "Pending Invoice" },
  { value: "pending_payment", label: "Pending Payment" },
  { value: "paid", label: "Paid" },
];

const CreateJob = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [clientName, setClientName] = useState<string>("");

  // Fetch campaigns for the dropdown with client information
  const { data: campaigns } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("id, name, client:client_id(id, name)")
        .eq("active", true)
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch providers for the dropdown
  const { data: providers } = useQuery({
    queryKey: ["providers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("providers")
        .select("id, name")
        .eq("active", true)
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch managers for the dropdown
  const { data: managers } = useQuery({
    queryKey: ["managers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("managers")
        .select("id, name")
        .eq("active", true)
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  // Form setup
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      campaign_id: "",
      provider_id: "",
      manager_id: "",
      value: 0,
      currency: "euro",
      status: "draft",
      paid: false,
      manager_ok: false,
      months: [],
      due_date: "",
      public_notes: "",
      private_notes: "",
    },
  });

  // Update client name when campaign changes
  useEffect(() => {
    if (selectedCampaign && campaigns) {
      const campaign = campaigns.find(c => c.id === selectedCampaign);
      setClientName(campaign?.client?.name || t("jobs.unknownClient"));
    } else {
      setClientName("");
    }
  }, [selectedCampaign, campaigns, t]);

  // Watch campaign_id changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "campaign_id" && value.campaign_id) {
        setSelectedCampaign(value.campaign_id as string);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Create job mutation
  const createJob = useMutation({
    mutationFn: async (values: JobFormValues) => {
      const { data, error } = await supabase
        .from("jobs")
        .insert({
          campaign_id: values.campaign_id,
          provider_id: values.provider_id,
          manager_id: values.manager_id,
          value: values.value,
          currency: values.currency as any,
          status: values.status as any,
          paid: values.paid,
          manager_ok: values.manager_ok,
          months: values.months as any[],
          due_date: values.due_date || null,
          public_notes: values.public_notes || null,
          private_notes: values.private_notes || null,
        })
        .select("id")
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast({
        title: t("jobs.jobCreated"),
        description: t("jobs.jobCreatedDescription"),
      });
      navigate("/jobs");
    },
    onError: (error) => {
      console.error("Error creating job:", error);
      toast({
        title: t("common.error"),
        description: t("jobs.jobCreateError"),
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (values: JobFormValues) => {
    createJob.mutate(values);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{t("jobs.createJob")}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {t("jobs.createJobDescription")}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("jobs.jobDetails")}</CardTitle>
            <CardDescription>
              {t("jobs.updateJobDetails")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Campaign Selection */}
                  <FormField
                    control={form.control}
                    name="campaign_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("jobs.campaign")}</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedCampaign(value);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("jobs.selectCampaign")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {campaigns && campaigns.length > 0 ? (
                              campaigns.map((campaign) => (
                                <SelectItem key={campaign.id} value={campaign.id}>
                                  {campaign.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-campaigns" disabled>
                                {t("campaigns.noCampaignsAvailable")}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Client Information (Read-only) */}
                  <div className="space-y-2">
                    <FormLabel>{t("jobs.client")}</FormLabel>
                    <div className="p-2 border rounded-md bg-slate-50 dark:bg-slate-800 h-10 flex items-center">
                      {clientName || t("jobs.selectCampaignFirst")}
                    </div>
                  </div>

                  {/* Provider Selection */}
                  <FormField
                    control={form.control}
                    name="provider_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("jobs.provider")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("jobs.selectProvider")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {providers && providers.length > 0 ? (
                              providers.map((provider) => (
                                <SelectItem key={provider.id} value={provider.id}>
                                  {provider.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-providers" disabled>
                                {t("providers.noProvidersAvailable")}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Manager Selection */}
                  <FormField
                    control={form.control}
                    name="manager_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("jobs.manager")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("jobs.selectManager")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {managers && managers.length > 0 ? (
                              managers.map((manager) => (
                                <SelectItem key={manager.id} value={manager.id}>
                                  {manager.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-managers" disabled>
                                {t("managers.noManagersAvailable")}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Value */}
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("jobs.value")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Enter value"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Due Date */}
                  <FormField
                    control={form.control}
                    name="due_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("jobs.dueDate")}</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            placeholder="Enter due date"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Months */}
                <FormField
                  control={form.control}
                  name="months"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>{t("jobs.months")}</FormLabel>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("jobs.selectMonths")}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {months.map((month) => (
                          <FormField
                            key={month.value}
                            control={form.control}
                            name="months"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={month.value}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(month.value)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, month.value])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== month.value
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {month.label}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="public_notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("jobs.publicNotes")}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Notes visible to all parties"
                            className="resize-none"
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
                    name="private_notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("jobs.privateNotes")}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Internal notes"
                            className="resize-none"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/jobs")}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button type="submit" disabled={createJob.isPending}>
                    {createJob.isPending ? t("common.creating") : t("jobs.createJob")}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateJob;
