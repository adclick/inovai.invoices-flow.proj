import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { DocumentUploader } from "@/components/jobs/DocumentUploader";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define Job interface
interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  client_id: string | null;
  manager_id: string | null;
  provider_id: string | null;
  campaign_id: string | null;
  documents: string[];
  created_at: string;
  updated_at: string;
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.string(),
  client_id: z.string().optional().nullable(),
  manager_id: z.string().optional().nullable(),
  provider_id: z.string().optional().nullable(),
  campaign_id: z.string().optional().nullable(),
});

type FormData = z.infer<typeof formSchema>;

const EditJob: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [job, setJob] = useState<Job | null>(null);
  const [managers, setManagers] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [documents, setDocuments] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "pending",
      client_id: null,
      manager_id: null,
      provider_id: null,
      campaign_id: null,
    },
  });

  useEffect(() => {
    if (id) {
      fetchJob();
      fetchRelatedData();
    }
  }, [id]);

  const fetchJob = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      if (data) {
        setJob(data as Job);
        setDocuments(data.documents || []);
        reset({
          title: data.title || "",
          description: data.description || "",
          status: data.status || "pending",
          client_id: data.client_id || null,
          manager_id: data.manager_id || null,
          provider_id: data.provider_id || null,
          campaign_id: data.campaign_id || null,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to fetch job: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRelatedData = async () => {
    try {
      const [managersData, providersData, clientsData, campaignsData] = await Promise.all([
        supabase.from("managers").select("*"),
        supabase.from("providers").select("*"),
        supabase.from("clients").select("*"),
        supabase.from("campaigns").select("*"),
      ]);

      if (managersData.error) throw managersData.error;
      if (providersData.error) throw providersData.error;
      if (clientsData.error) throw clientsData.error;
      if (campaignsData.error) throw campaignsData.error;

      setManagers(managersData.data || []);
      setProviders(providersData.data || []);
      setClients(clientsData.data || []);
      setCampaigns(campaignsData.data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to fetch related data: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("jobs")
        .update({
          ...data,
          documents: documents,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job updated successfully.",
      });
      navigate("/jobs");
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to update job: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentsUpdated = (newDocuments: string[]) => {
    setDocuments(newDocuments);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent rounded-lg" />
          <div className="relative p-6">
            <h1 className="text-[32px] font-semibold text-slate-800 dark:text-slate-100">Edit Job</h1>
            <p className="text-base text-slate-600 dark:text-slate-400 mt-1">Update job details and manage documents</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-accent focus:ring-accent dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50"
                      {...register("title")}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-accent focus:ring-accent dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50"
                      {...register("description")}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Status
                    </label>
                    <select
                      id="status"
                      className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-accent focus:ring-accent dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50"
                      {...register("status")}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="client_id"
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Client
                    </label>
                    <select
                      id="client_id"
                      className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-accent focus:ring-accent dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50"
                      {...register("client_id")}
                    >
                      <option value={null}>Select a client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="manager_id"
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Manager
                    </label>
                    <select
                      id="manager_id"
                      className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-accent focus:ring-accent dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50"
                      {...register("manager_id")}
                    >
                      <option value={null}>Select a manager</option>
                      {managers.map((manager) => (
                        <option key={manager.id} value={manager.id}>
                          {manager.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="provider_id"
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Provider
                    </label>
                    <select
                      id="provider_id"
                      className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-accent focus:ring-accent dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50"
                      {...register("provider_id")}
                    >
                      <option value={null}>Select a provider</option>
                      {providers.map((provider) => (
                        <option key={provider.id} value={provider.id}>
                          {provider.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="campaign_id"
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Campaign
                    </label>
                    <select
                      id="campaign_id"
                      className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-accent focus:ring-accent dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50"
                      {...register("campaign_id")}
                    >
                      <option value={null}>Select a campaign</option>
                      {campaigns.map((campaign) => (
                        <option key={campaign.id} value={campaign.id}>
                          {campaign.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/jobs")}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Update Job</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent>
                {job && (
                  <DocumentUploader
                    jobId={job.id}
                    existingDocuments={documents}
                    onDocumentsUpdated={handleDocumentsUpdated}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditJob;
