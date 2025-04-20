
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
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentUploader } from "@/components/jobs/DocumentUploader";
import { JobStatusField } from "@/components/jobs/JobStatusField";
import { Job } from "@/types/job";

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

interface EditJobPageProps {
  job: Job | undefined;
  isLoadingJob: boolean;
  form: ReturnType<typeof useForm<JobFormValues>>;
  updateJobMutation: ReturnType<typeof useMutation<Job, unknown, JobFormValues, unknown>>;
  campaigns: any[];
  clients: any[];
  providers: any[];
  managers: any[];
  documents: string[] | null;
  setDocuments: React.Dispatch<React.SetStateAction<string[] | null>>;
  currentTab: string;
  setCurrentTab: React.Dispatch<React.SetStateAction<string>>;
  clientName: string;
  setSelectedCampaign: React.Dispatch<React.SetStateAction<string>>;
  selectedCampaign: string;
  selectedCampaignClientName: string;
}

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

const DetailsForm: React.FC<{
  form: ReturnType<typeof useForm<JobFormValues>>;
  campaigns: any[];
  providers: any[];
  managers: any[];
  months: { value: string; label: string }[];
  currencyOptions: { value: string; label: string }[];
  statusOptions: { value: string; label: string }[];
  selectedCampaignClientName: string;
  selectedCampaign: string;
  setSelectedCampaign: React.Dispatch<React.SetStateAction<string>>;
  updateJobMutation: ReturnType<
    typeof useMutation<Job, unknown, JobFormValues, unknown>
  >;
  t: (key: string) => string;
  onCancel: () => void;
}> = ({
  form,
  campaigns,
  providers,
  managers,
  months,
  currencyOptions,
  statusOptions,
  selectedCampaignClientName,
  selectedCampaign,
  setSelectedCampaign,
  updateJobMutation,
  t,
  onCancel,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("jobs.jobDetails")}</CardTitle>
        <CardDescription>{t("jobs.updateJobDetails")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => updateJobMutation.mutate(data))} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      value={field.value}
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

              <div className="space-y-2">
                <FormLabel>{t("jobs.client")}</FormLabel>
                <div
                  className="p-2 border rounded-md bg-slate-50 dark:bg-slate-800 h-10 flex items-center"
                  aria-live="polite"
                >
                  {selectedCampaignClientName ||
                    t("jobs.selectCampaignFirst")}
                </div>
                <p className="text-xs text-slate-500">{t("jobs.clientDerivedFromCampaign")}</p>
              </div>

              <FormField
                control={form.control}
                name="provider_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("jobs.provider")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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

              <FormField
                control={form.control}
                name="manager_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("jobs.manager")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                        placeholder={t("jobs.value")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("jobs.currency")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("jobs.selectCurrency")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("jobs.status")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("jobs.selectStatus")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("jobs.dueDate")}</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        placeholder={t("jobs.dueDate")}
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
              name="months"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>{t("jobs.months")}</FormLabel>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("jobs.selectMonthsDescription")}
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
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(month.value)}
                                  onCheckedChange={(checked) =>
                                    checked
                                      ? field.onChange([...field.value, month.value])
                                      : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== month.value
                                        )
                                      )
                                  }
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="public_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("jobs.publicNotes")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("jobs.publicNotesPlaceholder")}
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
                        placeholder={t("jobs.privateNotesPlaceholder")}
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

            <FormField
              control={form.control}
              name="provider_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("jobs.providerMessage")}</FormLabel>
                  <FormDescription>
                    {t("jobs.providerMessageDescription")}
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder={t("jobs.providerMessagePlaceholder")}
                      className="resize-none border-2 border-purple-400 bg-purple-50 dark:bg-purple-900 p-3 rounded-md"
                      rows={4}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={onCancel}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("common.back")}
              </Button>
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={updateJobMutation.isPending}>
                  {updateJobMutation.isPending
                    ? t("common.updating")
                    : t("jobs.updateJob")}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

const DocumentsTab: React.FC<{
  jobId: string;
  documents: string[] | null;
  onDocumentsUpdated: (newDocuments: string[]) => void;
  currentTab: string;
  setCurrentTab: React.Dispatch<React.SetStateAction<string>>;
  t: (key: string) => string;
}> = ({ jobId, documents, onDocumentsUpdated, currentTab, setCurrentTab, t }) => {
  const navigate = useNavigate();
  return (
    <TabsContent value="documents" aria-label={t("jobs.documentsTabContent")}>
      <Card>
        <CardHeader>
          <CardTitle>{t("jobs.documents")}</CardTitle>
          <CardDescription>{t("jobs.documents")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <DocumentUploader
              jobId={jobId}
              existingDocuments={documents}
              onDocumentsUpdated={onDocumentsUpdated}
            />
          </div>
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setCurrentTab("details")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("common.back")}
            </Button>
            <Button variant="outline" onClick={() => navigate("/jobs")}>
              {t("common.done")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};

const StatusSection: React.FC<{
  status: string;
  onChange: (value: string) => void;
  disabled: boolean;
  t: (key: string) => string;
}> = ({ status, onChange, disabled, t }) => {
  return (
    <div className="mb-6" aria-label={t("jobs.statusSection")}>
      <JobStatusField value={status} onChange={onChange} disabled={disabled} />
    </div>
  );
};

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

  // Form definition with translations passed as keys (will be replaced later)
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema.transform((data) => data)), // the resolver expects valid translation keys for errors
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

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("id, name").order("name");
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
  const updateJobMutation = useMutation({
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
      return data;
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

  const handleDocumentsUpdated = (newDocuments: string[]) => {
    setDocuments(newDocuments);
    queryClient.invalidateQueries({ queryKey: ["job", id] });
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

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            {t("jobs.editJob")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {t("jobs.updateJobDetails")}
          </p>
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
              t={t}
              onCancel={() => navigate("/jobs")}
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
      </div>
    </DashboardLayout>
  );
};

export default EditJob;

