
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BaseEntityFormProps } from "../common/EntityModal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DetailsForm from "./DetailsForm";
import DocumentsTab from "./DocumentsTab";
import { Job } from "@/types/job";

// Form schema with validation
const jobSchema = z.object({
  campaign_id: z.string().min(1, { message: "Campaign is required" }),
  provider_id: z.string().min(1, { message: "Provider is required" }),
  manager_id: z.string().min(1, { message: "Manager is required" }),
  value: z.coerce.number().min(0, { message: "Value must be at least 0" }),
  currency: z.enum(["euro", "usd", "gbp"]),
  status: z.enum(["draft", "active", "pending_invoice", "pending_validation", "pending_payment", "paid"]),
  paid: z.boolean().default(false),
  manager_ok: z.boolean().default(false),
  months: z.array(z.string()).min(1, { message: "At least one month is required" }),
  due_date: z.string().optional(),
  public_notes: z.string().optional(),
  private_notes: z.string().optional(),
});

type FormValues = z.infer<typeof jobSchema>;

const JobForm: React.FC<BaseEntityFormProps> = ({
  id,
  mode,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = mode === "edit";
  const [currentTab, setCurrentTab] = useState("details");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState("");

  // Setup form with default values
  const form = useForm<FormValues>({
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

  // Fetch clients for selection
  const { data: clients, isLoading: isClientsLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch campaigns
  const { data: campaigns, isLoading: isCampaignsLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("id, name, client_id, client:client_id(id, name)")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch providers
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

  // Fetch managers
  const { data: managers, isLoading: isManagersLoading } = useQuery({
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

  // Fetch job data if in edit mode
  const { data: jobData, isLoading: isJobLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      
      // Find client ID from campaign
      if (campaigns) {
        const campaign = campaigns.find(c => c.id === data.campaign_id);
        if (campaign && campaign.client) {
          setSelectedClientId(campaign.client.id);
        }
      }
      
      setSelectedCampaign(data.campaign_id);
      
      // Fill form with job data
      form.reset({
        campaign_id: data.campaign_id,
        provider_id: data.provider_id,
        manager_id: data.manager_id,
        value: data.value,
        currency: data.currency,
        status: data.status,
        paid: data.paid,
        manager_ok: data.manager_ok,
        months: data.months || [],
        due_date: data.due_date || "",
        public_notes: data.public_notes || "",
        private_notes: data.private_notes || "",
      });
      
      return data;
    },
    enabled: isEditMode && !!id && !!campaigns,
  });

  // Update job mutation
  const updateJobMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const { data, error } = await supabase
        .from("jobs")
        .update(values)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Job;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["job", id] });
      toast({
        title: t("jobs.jobUpdated"),
        description: t("jobs.jobUpdatedDescription"),
      });
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      console.error("Error updating job:", error);
      toast({
        title: t("common.error"),
        description: t("jobs.jobUpdateError"),
        variant: "destructive",
      });
    },
  });

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const { data, error } = await supabase
        .from("jobs")
        .insert([values])
        .select()
        .single();
      
      if (error) throw error;
      return data as Job;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast({
        title: t("jobs.jobCreated"),
        description: t("jobs.jobCreatedDescription"),
      });
      onSuccess?.();
      onClose();
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
  const onSubmit = (values: FormValues) => {
    if (isEditMode && id) {
      updateJobMutation.mutate(values);
    } else {
      createJobMutation.mutate(values);
    }
  };

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    setSelectedCampaign("");
    form.setValue("campaign_id", "");
  };

  // Update documents handler
  const handleDocumentsUpdated = (newDocuments: string[]) => {
    if (!id) return;
    
    supabase
      .from("jobs")
      .update({ documents: newDocuments })
      .eq("id", id)
      .then(({ error }) => {
        if (error) {
          toast({
            title: t("common.error"),
            description: t("jobs.documentUpdateError"),
            variant: "destructive",
          });
          console.error("Error updating documents:", error);
        } else {
          queryClient.invalidateQueries({ queryKey: ["job", id] });
          toast({
            title: t("jobs.documentsUpdated"),
            description: t("jobs.documentsUpdatedDescription"),
          });
        }
      });
  };

  const isLoading = isClientsLoading || isCampaignsLoading || isProvidersLoading || isManagersLoading || isJobLoading;
  const isSubmitting = createJobMutation.isPending || updateJobMutation.isPending;

  // Currency options
  const currencyOptions = [
    { value: "euro", label: "€ (Euro)" },
    { value: "usd", label: "$ (USD)" },
    { value: "gbp", label: "£ (GBP)" },
  ];

  // Status options
  const statusOptions = [
    { value: "draft", label: t("jobs.status.draft") },
    { value: "active", label: t("jobs.status.active") },
    { value: "pending_invoice", label: t("jobs.status.pendingInvoice") },
    { value: "pending_validation", label: t("jobs.status.pendingValidation") },
    { value: "pending_payment", label: t("jobs.status.pendingPayment") },
    { value: "paid", label: t("jobs.status.paid") },
  ];

  // Months options
  const months = [
    { value: "january", label: t("months.january") },
    { value: "february", label: t("months.february") },
    { value: "march", label: t("months.march") },
    { value: "april", label: t("months.april") },
    { value: "may", label: t("months.may") },
    { value: "june", label: t("months.june") },
    { value: "july", label: t("months.july") },
    { value: "august", label: t("months.august") },
    { value: "september", label: t("months.september") },
    { value: "october", label: t("months.october") },
    { value: "november", label: t("months.november") },
    { value: "december", label: t("months.december") },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="details">{t("jobs.details")}</TabsTrigger>
            <TabsTrigger value="documents" disabled={!isEditMode}>{t("jobs.documents")}</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardContent className="pt-6">
                <DetailsForm
                  form={form}
                  campaigns={campaigns || []}
                  providers={providers || []}
                  managers={managers || []}
                  clients={clients || []}
                  months={months}
                  currencyOptions={currencyOptions}
                  statusOptions={statusOptions}
                  selectedClientId={selectedClientId}
                  onClientChange={handleClientChange}
                  selectedCampaign={selectedCampaign}
                  setSelectedCampaign={setSelectedCampaign}
                  updateJobMutation={updateJobMutation}
                  t={t}
                  onCancel={onClose}
                  formSubmitHandler={onSubmit}
                  isClientsLoading={isClientsLoading}
                  isProvidersLoading={isProvidersLoading}
                  isManagersLoading={isManagersLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {isEditMode && (
            <DocumentsTab
              jobId={id || ""}
              documents={jobData?.documents || []}
              onDocumentsUpdated={handleDocumentsUpdated}
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              t={t}
            />
          )}
        </Tabs>
      </form>
    </Form>
  );
};

export default JobForm;
