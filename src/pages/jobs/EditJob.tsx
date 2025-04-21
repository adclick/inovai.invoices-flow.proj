import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatJobStatus, Job } from "@/types/job";
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

const jobSchema = z.object({
  campaign_id: z.string().min(1, "jobs.selectCampaign"),
  provider_id: z.string().min(1, "jobs.selectProvider"),
  manager_id: z.string().min(1, "jobs.selectManager"),
  value: z.coerce.number().min(0, "jobs.valueRequired"),
  currency: z.string().min(1, "jobs.selectCurrency"),
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
  const [clientName, setClientName] = useState<string>("");

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

  // Data fetching queries
  const { data: campaigns } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("id, name, client:client_id(id, name)")
        .order("name");
      if (error) throw error;
      return data;
    },
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

      const { data: campaign } = await supabase.from("campaigns").select("name, client:client_id(name)").eq("id", job.campaign_id).single();
      const { data: provider } = await supabase.from("providers").select("name").eq("id", job.provider_id).single();
      const { data: manager } = await supabase.from("managers").select("name").eq("id", job.manager_id).single();

      let formattedDueDate = "";
      if (job.due_date) {
        const date = new Date(job.due_date);
        formattedDueDate = date.toISOString().split("T")[0];
      }

      setPreviousStatus(job.status);
      setSelectedCampaign(job.campaign_id);
      setClientName((job as any).client_name || t("jobs.unknownClient"));
      setDocuments(job.documents);

      form.reset({
        campaign_id: job.campaign_id,
        provider_id: job.provider_id,
        manager_id: job.manager_id,
        value: job.value,
        currency: job.currency,
        status: job.status,
        paid: job.paid,
        manager_ok: job.manager_ok,
        months: job.months,
        due_date: formattedDueDate,
        public_notes: job.public_notes || "",
        private_notes: job.private_notes || "",
        provider_message: job.provider_message || "",
      });

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

  // watch for campaign changes to update client name
  useEffect(() => {
    if (selectedCampaign && campaigns) {
      const campaign = campaigns.find((c) => c.id === selectedCampaign);
      setClientName(campaign?.client?.name || t("jobs.unknownClient"));
    } else {
      setClientName("");
    }
  }, [selectedCampaign, campaigns, t]);

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
      navigate("/jobs");
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
      <DashboardLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
              {t("jobs.editJob")}
            </h1>
          </div>
          <div className="flex justify-center items-center h-64">
            <p className="text-slate-500 dark:text-slate-400">{t("common.loading")}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
              {t("jobs.editJob")}
            </h1>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{t("common.error")}</p>
            <Button className="mt-4" onClick={() => navigate("/jobs")}>
              {t("common.back")}
            </Button>
          </div>
        </div>
      </DashboardLayout>
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

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto">
				<div className=" flex justify-between items-center">

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            {t("jobs.editJob")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {t("jobs.updateJobDetails")}
          </p>
        </div>
					<Badge 
							className={`${getStatusColor(job.status)} px-3 py-1 text-sm font-medium`}
							variant="outline"
						>
							{formatJobStatus(job.status)}
					</Badge>
				</div>

        <StatusSection
          status={form.watch("status")}
          onChange={(value) => form.setValue("status", value as any)}
          disabled={updateJobMutation.isPending}
          t={t}
        />

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">{t("jobs.jobDetails")}</TabsTrigger>
            <TabsTrigger value="documents">{t("jobs.documents")}</TabsTrigger>
          </TabsList>

          <TabsContent value="details" aria-label={t("jobs.detailsTabContent")}>
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
              selectedCampaignClientName={clientName}
              selectedCampaign={selectedCampaign}
              setSelectedCampaign={setSelectedCampaign}
              updateJobMutation={updateJobMutation}
              onCancel={() => navigate("/jobs")}
              // Change form submit to open modal
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

        {/* Update ConfirmUpdateModal usage */}
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
      </div>
    </DashboardLayout>
  );
};

export default EditJob;
