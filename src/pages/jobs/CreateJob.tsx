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
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
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

// Define the schema for job creation form
const formSchema = z.object({
  client_id: z.string().min(1, { message: "Please select a client." }),
  campaign_id: z.string().min(1, { message: "Please select a campaign." }),
  provider_id: z.string().min(1, { message: "Please select a provider." }),
  manager_id: z.string().min(1, { message: "Please select a manager." }),
  value: z.number({ required_error: "Value is required." }).min(0, { message: "Value must be at least 0." }),
  currency: z.string().min(1, { message: "Please select a currency." }),
  status: z.string().min(1, { message: "Please select a status." }),
  due_date: z.date({ required_error: "Due date is required." }),
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
      currency: "",
      status: "",
      due_date: new Date(),
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
    // Correct field name from client_id to campaign_id
    setCampaignOptions([]);
    setSelectedClient(value);
  };

  // Function to handle form submission
  const onSubmit = async (values: JobFormValues) => {
    try {
      const { data: job, error: jobError } = await supabase
        .from("jobs")
        .insert([
          {
            ...values,
            value: Number(values.value),
            created_by: user?.id,
          },
        ])
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

  const steps = [
    {
      title: t("jobs.jobDetails"),
      description: t("jobs.updateJobDetails"),
      content: (
        <DetailsForm
          form={form}
          clients={clients}
          campaignOptions={campaignOptions}
          isClientsLoading={isClientsLoading}
          providers={providers}
          isProvidersLoading={isProvidersLoading}
          managers={managers}
          isManagersLoading={isManagersLoading}
          onClientChange={handleClientChange}
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
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
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
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  {t("common.back")}
                </Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  {t("common.next")}
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
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
