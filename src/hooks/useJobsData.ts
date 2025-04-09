
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Job = {
  id: string;
  client_id: string;
  campaign_id: string;
  provider_id: string;
  manager_id: string;
  value: number;
  currency: string;
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
