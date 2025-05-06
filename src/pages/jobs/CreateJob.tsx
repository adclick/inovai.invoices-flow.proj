
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DetailsForm from "@/components/jobs/DetailsForm";
import MonthsForm from "@/components/jobs/MonthsForm";
import NotesForm from "@/components/jobs/NotesForm";
import DocumentsForm from "@/components/jobs/DocumentsForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

// Define the schema for job creation form with proper enums for currency and status
const formSchema = z.object({
  client_id: z.string().min(1, { message: "Please select a client." }),
  campaign_id: z.string().min(1, { message: "Please select a campaign." }),
  provider_id: z.string().min(1, { message: "Please select a provider." }),
  manager_id: z.string().min(1, { message: "Please select a manager." }),
  value: z.number({ required_error: "Value is required." }).min(0, { message: "Value must be at least 0." }),
  currency: z.enum(["euro", "usd", "gbp"]).default("euro"),
  status: z.enum(["draft", "active", "pending_invoice", "pending_validation", "pending_payment", "paid"]).default("draft"),
  due_date: z.string().optional(),
  months: z.array(z.string()).min(1, { message: "Please select at least one month." }),
  public_notes: z.string().optional(),
  private_notes: z.string().optional(),
  notify_provider: z.boolean().default(false).optional(),
  message_to_provider: z.string().optional(),
  documents: z.array(z.string()).optional(),
});

type JobFormValues = z.infer<typeof formSchema>;

const CreateJob: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [campaignOptions, setCampaignOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [currentStep, setCurrentStep] = useState(0);

  // React Hook Form setup
  const form = useForm<JobFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_id: "",
      campaign_id: "",
      provider_id: "",
      manager_id: "",
      value: 0,
      currency: "euro",
      status: "draft",
      due_date: "",
      months: [],
      public_notes: "",
      private_notes: "",
      notify_provider: false,
      message_to_provider: "",
      documents: [],
    },
  });

  // Fetch clients for the client select dropdown
  const { data: clients, isLoading: isClientsLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name")
        .eq("active", true)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  // Fetch providers for the provider select dropdown
  const { data: providers, isLoading: isProvidersLoading } = useQuery({
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

  // Fetch managers for the manager select dropdown
  const { data: managers, isLoading: isManagersLoading } = useQuery({
    queryKey: ["managers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("managers")
        .select("id, name, email")
        .eq("active", true)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  // Fetch campaigns based on the selected client
  useEffect(() => {
    if (selectedClient) {
      const fetchCampaigns = async () => {
        const { data, error } = await supabase
          .from("campaigns")
          .select("id, name")
          .eq("client_id", selectedClient)
          .eq("active", true)
          .order("name");

        if (error) {
          console.error("Error fetching campaigns:", error);
          return;
        }

        const options = data.map((campaign) => ({
          value: campaign.id,
          label: campaign.name,
        }));
        setCampaignOptions(options);
      };

      fetchCampaigns();
    } else {
      setCampaignOptions([]);
    }
  }, [selectedClient]);

  // Handle client selection change
  const handleClientChange = (value: string) => {
    form.setValue("campaign_id", "");  // Reset campaign when client changes
    setSelectedClient(value);
  };

  // Function to handle form submission
  const onSubmit = async (values: JobFormValues) => {
    try {
      // Prepare the job data for insertion with proper type casting
      const jobData = {
        campaign_id: values.campaign_id,
        provider_id: values.provider_id,
        manager_id: values.manager_id,
        value: Number(values.value),
        currency: values.currency as "euro" | "usd" | "gbp",
        status: values.status as "draft" | "active" | "pending_invoice" | "pending_validation" | "pending_payment" | "paid",
        months: values.months as ("january" | "february" | "march" | "april" | "may" | "june" | "july" | "august" | "september" | "october" | "november" | "december")[],
        due_date: values.due_date || null,
        public_notes: values.public_notes || null,
        private_notes: values.private_notes || null,
        documents: values.documents || [],
        created_at: new Date().toISOString(),
        created_by: user?.id || null,
      };

      const { data: job, error: jobError } = await supabase
        .from("jobs")
        .insert(jobData)
        .select()
        .single();

      if (jobError) {
        console.error("Error creating job:", jobError);
        toast.error(t("jobs.jobCreateError"));
        return;
      }

      // Reset the form after successful submission
      form.reset();
      toast.success(t("jobs.jobCreated"));
      navigate("/jobs");
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error(t("common.error"));
    }
  };

  // Define months for selection
  const monthOptions = [
    { value: "january", label: t("common.january") },
    { value: "february", label: t("common.february") },
    { value: "march", label: t("common.march") },
    { value: "april", label: t("common.april") },
    { value: "may", label: t("common.may") },
    { value: "june", label: t("common.june") },
    { value: "july", label: t("common.july") },
    { value: "august", label: t("common.august") },
    { value: "september", label: t("common.september") },
    { value: "october", label: t("common.october") },
    { value: "november", label: t("common.november") },
    { value: "december", label: t("common.december") }
  ];

  // Define steps for the multi-step form
  const steps = [
    {
      title: t("jobs.jobDetails"),
      description: t("jobs.updateJobDetails"),
      content: (
        <DetailsForm
          form={form}
          clients={clients || []}
          campaigns={campaignOptions}
          providers={providers || []}
          isProvidersLoading={isProvidersLoading}
          managers={managers || []}
          isManagersLoading={isManagersLoading}
          months={monthOptions}
          currencyOptions={[
            { value: "euro", label: t("common.euro") },
            { value: "usd", label: t("common.usd") },
            { value: "gbp", label: t("common.gbp") },
          ]}
          statusOptions={[
            { value: "draft", label: t("jobs.draft") },
            { value: "active", label: t("jobs.active") },
          ]}
          selectedClientId={selectedClient || ""}
          onClientChange={handleClientChange}
          selectedCampaign={form.watch("campaign_id")}
          setSelectedCampaign={(value) => form.setValue("campaign_id", value)}
          updateJobMutation={{ isPending: false } as any}
          formSubmitHandler={() => {}}
          t={t}
          onCancel={() => navigate("/jobs")}
          isClientsLoading={isClientsLoading}
        />
      ),
    },
    {
      title: t("jobs.months"),
      description: t("jobs.selectMonthsDescription"),
      content: <MonthsForm form={form} />,
    },
    {
      title: t("common.details"),
      description: t("jobs.updateJobDetails"),
      content: <NotesForm form={form} />,
    },
    {
      title: t("jobs.documents"),
      description: t("jobs.uploadDocuments"),
      content: <DocumentsForm form={form} />,
    },
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-4xl md:p-8">
        <div className="mb-4">
          <Button variant="ghost" onClick={() => navigate("/jobs")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("common.back")}
          </Button>
          <h1 className="text-2xl font-bold">{t("jobs.createNew")}</h1>
        </div>
        <Separator className="mb-4" />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-lg font-medium">{steps[currentStep].title}</h2>
              <p className="text-sm text-muted-foreground">
                {steps[currentStep].description}
              </p>
              {steps[currentStep].content}
            </div>

            <div className="flex justify-between">
              {currentStep > 0 && (
                <Button
                  variant="secondary"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("common.back")}
                </Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  {t("common.next")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit">{t("common.submit")}</Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default CreateJob;
