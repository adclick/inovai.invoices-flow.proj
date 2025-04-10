import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { ArrowLeft } from "lucide-react";
import { DocumentUploader } from "@/components/jobs/DocumentUploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Job } from "@/types/job";

const jobSchema = z.object({
  client_id: z.string().min(1, "Please select a client"),
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
  { value: "new", label: "New" },
  { value: "manager_ok", label: "Manager OK" },
  { value: "pending_invoice", label: "Pending Invoice" },
  { value: "pending_payment", label: "Pending Payment" },
  { value: "paid", label: "Paid" },
];

const EditJob = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentTab, setCurrentTab] = useState("details");
  const [documents, setDocuments] = useState<string[] | null>(null);
  const [previousStatus, setPreviousStatus] = useState<string | null>(null);

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      client_id: "",
      campaign_id: "",
      provider_id: "",
      manager_id: "",
      value: 0,
      currency: "euro",
      status: "New",
      paid: false,
      manager_ok: false,
      months: [],
      due_date: "",
      public_notes: "",
      private_notes: "",
    },
  });

  const { data: job, isLoading: isLoadingJob } = useQuery<Job>({
    queryKey: ["job", id],
    queryFn: async () => {
      if (!id) throw new Error("Job ID is required");

      const { data: job, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      // return data as Job;

			console.log(job);
      let formattedDueDate = "";
      if (job.due_date) {
        const date = new Date(job.due_date);
        formattedDueDate = date.toISOString().split('T')[0];
      }

      setPreviousStatus(job.status);
      
      form.reset({
        client_id: job.client_id,
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
      });

			return job as Job;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (job) {
			
    }
  }, [job, form]);

  const { data: clients } = useQuery({
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

  const { data: campaigns } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("id, name")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const { data: providers } = useQuery({
    queryKey: ["providers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("providers")
        .select("id, name")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const { data: managers } = useQuery({
    queryKey: ["managers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("managers")
        .select("id, name")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const updateJob = useMutation({
    mutationFn: async (values: JobFormValues) => {
      if (!id) throw new Error("Job ID is required");

      const { data, error } = await supabase
        .from("jobs")
        .update({
          client_id: values.client_id,
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
        .eq("id", id)
        .select("id")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data, values) => {
      if (previousStatus && values.status !== previousStatus) {
        try {
          const response = await supabase.functions.invoke('send-job-status-update', {
            body: { 
              job_id: id,
              new_status: values.status 
            }
          });
          
          if (response.error) {
            console.error("Error sending notification:", response.error);
            toast({
              title: "Warning",
              description: "Job updated but notification emails could not be sent.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Success",
              description: "Job updated and notifications sent.",
            });
          }
        } catch (error) {
          console.error("Error invoking edge function:", error);
          toast({
            title: "Warning",
            description: "Job updated but notification emails could not be sent.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Job updated",
          description: "The job has been successfully updated.",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["job", id] });
      navigate("/jobs");
    },
    onError: (error) => {
      console.error("Error updating job:", error);
      toast({
        title: "Error",
        description: "Failed to update the job. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: JobFormValues) => {
    updateJob.mutate(values);
  };

  const handleDocumentsUpdated = (newDocuments: string[]) => {
    setDocuments(newDocuments);
    queryClient.invalidateQueries({ queryKey: ["job", id] });
  };

  if (isLoadingJob) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Edit Job</h1>
          </div>
          <div className="flex justify-center items-center h-64">
            <p className="text-slate-500 dark:text-slate-400">Loading job details...</p>
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
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Edit Job</h1>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <p className="text-red-600 dark:text-red-400">Job not found</p>
            <Button
              className="mt-4"
              onClick={() => navigate("/jobs")}
            >
              Back to Jobs
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
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Edit Job</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Update job details
          </p>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Job Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
                <CardDescription>
                  Update the job information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="client_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a client" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {clients && clients.length > 0 ? (
                                  clients.map((client) => (
                                    <SelectItem key={client.id} value={client.id}>
                                      {client.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="no-clients" disabled>
                                    No clients available
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
                        name="campaign_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Campaign</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a campaign" />
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
                                    No campaigns available
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
                        name="provider_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Provider</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a provider" />
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
                                    No providers available
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
                            <FormLabel>Manager</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a manager" />
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
                                    No managers available
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
                            <FormLabel>Value</FormLabel>
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

                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select currency" />
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
                            <FormLabel>Status</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
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
                            <FormLabel>Due Date (optional)</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                placeholder="Enter due date"
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
                            <FormLabel>Months</FormLabel>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Select months this job applies to
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="public_notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Public Notes (optional)</FormLabel>
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
                            <FormLabel>Private Notes (optional)</FormLabel>
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

                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={() => navigate("/jobs")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Jobs
                      </Button>
                      <div className="flex justify-end space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => navigate("/jobs")}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={updateJob.isPending}>
                          {updateJob.isPending ? "Updating..." : "Update Job"}
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Job Documents</CardTitle>
                <CardDescription>
                  Upload and manage documents for this job
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {id && (
                    <DocumentUploader
                      jobId={id}
                      existingDocuments={documents}
                      onDocumentsUpdated={handleDocumentsUpdated}
                    />
                  )}
                </div>
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentTab("details")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Details
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/jobs")}
                  >
                    Done
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default EditJob;
