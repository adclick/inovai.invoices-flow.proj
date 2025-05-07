import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Job } from "@/types/job";
import DetailsForm from "@/components/jobs/DetailsForm";
import DocumentsTab from "@/components/jobs/DocumentsTab";
import StatusSection from "@/components/jobs/StatusSection";
import {
	Dialog, DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
	DialogClose
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import EditPageLayout from "@/components/common/EditPageLayout";

const jobSchema = z.object({
  campaign_id: z.string().min(1, "jobs.selectCampaign"),
  provider_id: z.string().min(1, "jobs.selectProvider"),
  manager_id: z.string().min(1, "jobs.selectManager"),
  value: z.coerce.number().min(0, "jobs.valueRequired"),
  currency: z.enum(["euro", "usd"], { errorMap: (issue, ctx) => ({ message: ctx.defaultError.replace("Invalid enum value.", "jobs.selectCurrency") }) }),
  status: z.string().min(1, "jobs.selectStatus"),
  paid: z.boolean().default(false),
  manager_ok: z.boolean().default(false),
  months: z.array(z.string()).min(1, "jobs.selectMonths"),
  due_date: z.string().optional(),
  public_notes: z.string().optional(),
  private_notes: z.string().optional(),
  provider_message: z.string().optional(),
});
type JobFormValues = z.infer<typeof jobSchema>;

const monthsList = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

// Move ConfirmUpdateModal outside of EditJob component
interface ConfirmUpdateModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  pendingFormData: JobFormValues | null;
  providerMessage: string;
  onProviderMessageChange: (message: string) => void;
  t: (key: string) => string;
}

const ConfirmUpdateModal: React.FC<ConfirmUpdateModalProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  onCancel,
  pendingFormData,
  providerMessage,
  onProviderMessageChange,
  t,
}) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>{t("jobs.confirmJobUpdate")}</DialogTitle>
        <DialogDescription>
          {t("jobs.confirmUpdateMessage")}
        </DialogDescription>
				
      </DialogHeader>

      {pendingFormData && pendingFormData.status === "pending_invoice" && (
        <div className="mt-4">
          <label
            htmlFor="providerMessage"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {t("jobs.messageToProviderLabel")}
          </label>
          <textarea
            id="providerMessage"
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:bg-slate-800 dark:text-white"
            value={providerMessage}
            onChange={(e) => onProviderMessageChange(e.target.value)}
          />
        </div>
      )}

      <DialogFooter className="flex justify-end space-x-2 mt-6">
        <Button
          variant="outline"
          onClick={onCancel}
        >
          {t("common.cancel")}
        </Button>
        <Button onClick={onConfirm}>
          {t("common.confirm")}
        </Button>
      </DialogFooter>

      <DialogClose />
    </DialogContent>
  </Dialog>
);

const EditJob: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State and tab selection
  const [currentTab, setCurrentTab] = useState("details");
  const [documents, setDocuments] = useState<string[] | null>(null);
  const [previousStatus, setPreviousStatus] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  // Modal control
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<JobFormValues | null>(null);
  const [providerMessageForModal, setProviderMessageForModal] = useState<string>("");

  // Form definition
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
      provider_message: "",
    },
  });

  // Fetch clients for dropdown
  const { data: clients } = useQuery({
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

  // Data fetching queries
  const { data: campaigns } = useQuery({
    queryKey: ["campaigns", selectedClientId],
    queryFn: async () => {
			console.log("selectedClientId", selectedClientId);
      // Base query
      let query = supabase
        .from("campaigns")
        .select("id, name, client:client_id(id, name)")
        .order("name");
      
      // Filter by client if one is selected
      if (selectedClientId) {
        query = query.eq("client_id", selectedClientId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: true, // Always fetch campaigns, we'll filter them by client
  });

  const { data: providers } = useQuery({
    queryKey: ["providers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("providers").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: managers } = useQuery({
    queryKey: ["managers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("managers").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  // Load job details and reset form
  const { data: job, isLoading: isLoadingJob } = useQuery<Job>({
    queryKey: ["job", id],
    queryFn: async () => {
      if (!id) throw new Error("Job ID is required");

      const { data: job, error } = await supabase.from("jobs").select("*").eq("id", id).single();
      if (error) throw error;

      const { data: campaign } = await supabase.from("campaigns").select("name, client:client_id(id, name)").eq("id", job.campaign_id).single();
      const { data: provider } = await supabase.from("providers").select("name").eq("id", job.provider_id).single();
      const { data: manager } = await supabase.from("managers").select("name").eq("id", job.manager_id).single();

      let formattedDueDate = "";
      if (job.due_date) {
        const date = new Date(job.due_date);
        formattedDueDate = date.toISOString().split("T")[0];
      }

      setPreviousStatus(job.status);
      setSelectedCampaign(job.campaign_id);
      
      // Set the client ID based on campaign
      if (campaign?.client?.id) {
        setSelectedClientId(campaign.client.id);
      }

      // Validate and set currency for the form
      const jobCurrencyFromDb = job.currency as string; // Cast to string to handle any potential db values
      let validatedFormCurrency: "euro" | "usd" = "euro"; // Default to euro
      if (jobCurrencyFromDb === "euro" || jobCurrencyFromDb === "usd") {
        validatedFormCurrency = jobCurrencyFromDb;
      } else if (jobCurrencyFromDb) {
        console.warn(`Unexpected currency '${jobCurrencyFromDb}' found for job ${job.id}, defaulting to 'euro'.`);
      }

      form.reset({
        campaign_id: job.campaign_id,
        provider_id: job.provider_id,
        manager_id: job.manager_id,
        value: job.value,
        currency: validatedFormCurrency,
        status: job.status,
        paid: job.paid,
        manager_ok: job.manager_ok,
        months: job.months,
        due_date: formattedDueDate,
        public_notes: job.public_notes || "",
        private_notes: job.private_notes || "",
        provider_message: job.provider_message || "",
      });

      setDocuments(job.documents);

      return {
        ...job,
        campaign_name: campaign?.name || t("jobs.unknownCampaign"),
        client_name: campaign?.client?.name || t("jobs.unknownClient"),
        provider_name: provider?.name || t("jobs.unknownProvider"),
        manager_name: manager?.name || t("jobs.unknownManager"),
      } as Job;
    },
    enabled: !!id,
  });

  // watch for campaign changes to update client id
  useEffect(() => {
    if (selectedCampaign && campaigns) {
      const campaign = campaigns.find((c) => c.id === selectedCampaign);
      if (campaign?.client?.id && campaign.client.id !== selectedClientId) {
        setSelectedClientId(campaign.client.id);
      }
    }
  }, [selectedCampaign, campaigns, selectedClientId]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "campaign_id" && value.campaign_id) {
        setSelectedCampaign(value.campaign_id as string);
      }
    });

    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Mutation to update jobs
  const updateJobMutation = useMutation<Job, unknown, JobFormValues>({
    mutationFn: async (values: JobFormValues) => {
      if (!id) throw new Error("Job ID is required");

      const { data, error } = await supabase
        .from("jobs")
        .update({
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
          provider_message: values.provider_message || null,
        })
        .eq("id", id)
        .select("id")
        .single();

      if (error) throw error;
      return data as Job;
    },
    onSuccess: async (data, values) => {
      if (previousStatus && values.status !== previousStatus) {
        try {
          const response = await supabase.functions.invoke("send-job-status-update", {
            body: {
              job_id: id,
              new_status: values.status,
            },
          });

          if (response.error) {
            console.error("Error sending notification:", response.error);
            toast({
              title: t("common.warning"),
              description: t("jobs.notificationWarning"),
              variant: "destructive",
            });
          } else {
            toast({
              title: t("common.success"),
              description: t("jobs.notificationSuccess"),
            });
          }
        } catch (error) {
          console.error("Error invoking edge function:", error);
          toast({
            title: t("common.warning"),
            description: t("jobs.notificationWarning"),
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: t("jobs.jobUpdated"),
          description: t("jobs.jobUpdatedDescription"),
        });
      }

      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["job", id] });
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

  // Handle documents updated callback
  const handleDocumentsUpdated = (newDocuments: string[]) => {
    setDocuments(newDocuments);
    queryClient.invalidateQueries({ queryKey: ["job", id] });
  };

  // Handle client selection change
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    
    // Reset campaign selection if the selected campaign isn't from this client
    if (campaigns) {
      const clientCampaigns = campaigns.filter(c => c.client?.id === clientId);
      if (clientCampaigns.length > 0) {
        if (!clientCampaigns.some(c => c.id === selectedCampaign)) {
          setSelectedCampaign("");
          form.setValue("campaign_id", "");
        }
      } else {
        // No campaigns for this client, reset selection
        setSelectedCampaign("");
        form.setValue("campaign_id", "");
      }
    }
  };

  // Handle initial form submit - open confirmation modal instead of direct save
  const handleFormSubmit = (data: JobFormValues) => {
    setPendingFormData(data);
    setProviderMessageForModal("");
    setIsConfirmOpen(true);
  };

  // Handle confirmation modal cancel
  const handleConfirmCancel = () => {
    setIsConfirmOpen(false);
    setPendingFormData(null);
    setProviderMessageForModal("");
  };

  // Handle confirmation modal confirm save
  const handleConfirmSave = () => {
    if (!pendingFormData) {
      setIsConfirmOpen(false);
      return;
    }
    // If status is pending_invoice, override provider_message with modal value
    const saveData = {
      ...pendingFormData,
      provider_message: pendingFormData.status === "pending_invoice" ? providerMessageForModal : pendingFormData.provider_message,
    };
    updateJobMutation.mutate(saveData);
    setIsConfirmOpen(false);
  };

  if (isLoadingJob) {
    return (
      <EditPageLayout
        title={t("jobs.editJob")}
        description={t("jobs.updateJobDetails")}
        isLoading={true}
        loadingText={t("common.loadingJobData")}
        errorText={t("common.errorLoadingJob")}
        backPath="/jobs"
        backButtonText={t("common.backToJobsList")}
        contentClassName="p-0 sm:p-0 border-0"
      >
        <div className="flex justify-center items-center h-64">
          <p className="text-slate-500 dark:text-slate-400">{t("common.loading")}</p>
        </div>
      </EditPageLayout>
    );
  }

  if (!job) {
    return (
      <EditPageLayout
        title={t("jobs.editJob")}
        description={t("jobs.updateJobDetails")}
        isLoading={false}
        isError={true}
        loadingText={t("common.loadingJobData")}
        errorText={t("common.errorLoadingJob")}
        backPath="/jobs"
        backButtonText={t("common.backToJobsList")}
        contentClassName="p-0 sm:p-0 border-0"
      >
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{t("common.error")}</p>
          <Button className="mt-4" onClick={() => navigate("/jobs")}>
            {t("common.back")}
          </Button>
        </div>
      </EditPageLayout>
    );
  }

  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      'draft': 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100',
      'active': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      'pending_invoice': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
      'pending_validation': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
      'pending_payment': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
      'paid': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
    };
    
    return colorMap[status] || colorMap['draft'];
  };

  const statusMap: Record<string, string> = {
    'draft': t('jobs.draft'),
    'active': t('jobs.active'),
    'pending_invoice': t('jobs.pendingInvoice'),
    'pending_validation': t('jobs.pendingValidation'),
    'pending_payment': t('jobs.pendingPayment'),
    'paid': t('jobs.paid'),
  };
  
  return (
    <EditPageLayout
      title={t("jobs.editJob")}
      description={job ? `${t("jobs.editingJobId", { id: job.id })} (${job.campaign_name || t("jobs.unknownCampaign")})` : t("jobs.updateJobDetails")}
      isLoading={isLoadingJob}
      isError={false}
      loadingText={t("common.loadingJobData")}
      errorText={t("common.errorLoadingJob")}
      backPath="/jobs"
      backButtonText={t("common.backToJobsList")}
      contentClassName="p-0 sm:p-0 border-0"
    >
      <div className="px-6 pt-6 flex justify-between items-center">
        <Badge 
          className={`${getStatusColor(job.status)} px-3 py-1 text-sm font-medium`}
          variant="outline"
        >
          {statusMap[job.status] || job.status}
        </Badge>
      </div>

      <div className="px-6 mt-4">
        <StatusSection
          status={form.watch("status")}
          onChange={(value) => form.setValue("status", value as any)}
          disabled={updateJobMutation.isPending}
          t={t}
        />
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4 mt-4">
        <div className="px-6 border-b border-slate-200 dark:border-slate-700">
          <TabsList className="grid w-full grid-cols-2 bg-transparent p-0">
            <TabsTrigger value="details" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none -mb-px">{t("jobs.jobDetails")}</TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none -mb-px">{t("jobs.documents")}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="details" aria-label={t("jobs.detailsTabContent")} className="px-6 py-4">
          <DetailsForm
            form={form}
            campaigns={campaigns || []}
            providers={providers || []}
            managers={managers || []}
            months={monthsList.map((m) => ({ value: m, label: t(`common.${m}`) }))}
            currencyOptions={[
              { value: "euro", label: t("common.euro") },
              { value: "usd", label: t("common.usd") },
            ]}
            statusOptions={[
              { value: "draft", label: t("jobs.draft") },
              { value: "active", label: t("jobs.active") },
              { value: "pending_invoice", label: t("jobs.pendingInvoice") },
              { value: "pending_validation", label: t("jobs.pendingValidation") },
              { value: "pending_payment", label: t("jobs.pendingPayment") },
              { value: "paid", label: t("jobs.paid") },
            ]}
            clients={clients || []}
            selectedClientId={selectedClientId}
            onClientChange={handleClientChange}
            selectedCampaign={selectedCampaign}
            setSelectedCampaign={setSelectedCampaign}
            updateJobMutation={updateJobMutation}
            onCancel={() => navigate("/jobs")}
            formSubmitHandler={handleFormSubmit}
            t={t}
          />
        </TabsContent>

        {id && (
          <DocumentsTab
            jobId={id}
            documents={documents}
            onDocumentsUpdated={handleDocumentsUpdated}
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            t={t}
          />
        )}
      </Tabs>

      <ConfirmUpdateModal
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={handleConfirmSave}
        onCancel={handleConfirmCancel}
        pendingFormData={pendingFormData}
        providerMessage={providerMessageForModal}
        onProviderMessageChange={setProviderMessageForModal}
        t={t}
      />
    </EditPageLayout>
  );
};

export default EditJob;
