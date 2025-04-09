
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Job = {
  id: string;
  client_id: string;
  campaign_id: string;
  provider_id: string;
  manager_id: string;
  value: number;
  currency: "euro" | "usd" | "gbp";
  status: "New" | "Manager OK" | "Pending Invoice" | "Pending Payment" | "Paid";
  paid: boolean;
  manager_ok: boolean;
  months: string[];
  created_at: string;
  documents?: string[];
  client_name?: string;
  campaign_name?: string;
  provider_name?: string;
  manager_name?: string;
  due_date?: string | null;
  public_notes?: string | null;
  private_notes?: string | null;
  public_token?: string | null;
};

export const formatCurrency = (value: number, currency: string) => {
  const symbols: Record<string, string> = {
    euro: "€",
    usd: "$",
    gbp: "£"
  };

  const symbol = symbols[currency.toLowerCase()] || currency;
  return `${symbol}${value.toLocaleString()}`;
};

export const useJobsData = () => {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      // Fetch all jobs
      const { data: jobs, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (jobsError) throw jobsError;

      // Fetch related entities to get their names
      const { data: clients } = await supabase
        .from("clients")
        .select("id, name");

      const { data: campaigns } = await supabase
        .from("campaigns")
        .select("id, name");

      const { data: providers } = await supabase
        .from("providers")
        .select("id, name");

      const { data: managers } = await supabase
        .from("managers")
        .select("id, name");

      // Create lookup tables for entity names
      const clientMap = clients?.reduce((acc: Record<string, string>, client) => {
        acc[client.id] = client.name;
        return acc;
      }, {}) || {};

      const campaignMap = campaigns?.reduce((acc: Record<string, string>, campaign) => {
        acc[campaign.id] = campaign.name;
        return acc;
      }, {}) || {};

      const providerMap = providers?.reduce((acc: Record<string, string>, provider) => {
        acc[provider.id] = provider.name;
        return acc;
      }, {}) || {};

      const managerMap = managers?.reduce((acc: Record<string, string>, manager) => {
        acc[manager.id] = manager.name;
        return acc;
      }, {}) || {};

      // Add entity names to jobs
      return jobs.map((job: Job) => ({
        ...job,
        client_name: clientMap[job.client_id] || "Unknown Client",
        campaign_name: campaignMap[job.campaign_id] || "Unknown Campaign",
        provider_name: providerMap[job.provider_id] || "Unknown Provider",
        manager_name: managerMap[job.manager_id] || "Unknown Manager"
      }));
    },
  });
};

export const useJobById = (jobId: string) => {
  return useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      if (!jobId) {
        throw new Error("Job ID is required");
      }

      const { data: job, error: jobError } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .single();

      if (jobError) throw jobError;

      // Get associated entity names
      const { data: client } = await supabase
        .from("clients")
        .select("name")
        .eq("id", job.client_id)
        .single();

      const { data: campaign } = await supabase
        .from("campaigns")
        .select("name")
        .eq("id", job.campaign_id)
        .single();

      const { data: provider } = await supabase
        .from("providers")
        .select("name")
        .eq("id", job.provider_id)
        .single();

      const { data: manager } = await supabase
        .from("managers")
        .select("name")
        .eq("id", job.manager_id)
        .single();

      return {
        ...job,
        client_name: client?.name || "Unknown Client",
        campaign_name: campaign?.name || "Unknown Campaign",
        provider_name: provider?.name || "Unknown Provider",
        manager_name: manager?.name || "Unknown Manager"
      } as Job;
    },
    enabled: !!jobId,
  });
};
