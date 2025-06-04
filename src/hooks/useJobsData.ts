import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Job, formatJobStatus } from "@/types/job";

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
      // Fetch all jobs with their campaigns via junction table
      const { data: jobs, error: jobsError } = await supabase
        .from("jobs")
        .select(`
          *,
          job_campaigns(
            campaign_id,
            campaigns(id, name, client_id, clients(id, name))
          )
        `)
        .order("created_at", { ascending: false });

      if (jobsError) throw jobsError;

      // Fetch providers and managers for lookup
      const { data: providers } = await supabase
        .from("providers")
        .select("id, name");

      const { data: managers } = await supabase
        .from("managers")
        .select("id, name");

      const { data: jobTypes } = await supabase
        .from("job_types")
        .select("id, name");

      // Create lookup tables for entity names
      const providerMap = providers?.reduce((acc: Record<string, string>, provider) => {
        acc[provider.id] = provider.name;
        return acc;
      }, {}) || {};

      const managerMap = managers?.reduce((acc: Record<string, string>, manager) => {
        acc[manager.id] = manager.name;
        return acc;
      }, {}) || {};

      // Transform jobs with campaign information
      return jobs.map((job: any) => {
        const jobCampaigns = job.job_campaigns || [];
        const campaigns = jobCampaigns.map((jc: any) => jc.campaigns).filter(Boolean);
        const clients = campaigns.map((c: any) => c.clients).filter(Boolean);
        
        // Get unique client information
        const uniqueClients = clients.reduce((acc: any[], client: any) => {
          if (!acc.find(c => c.id === client.id)) {
            acc.push(client);
          }
          return acc;
        }, []);

        return {
          ...job,
          // Keep backward compatibility fields
          campaign_name: campaigns[0]?.name || "Unknown Campaign",
          client_name: uniqueClients[0]?.name || "Unknown Client",
          provider_name: providerMap[job.provider_id] || "Unknown Provider",
          manager_name: managerMap[job.manager_id] || "Unknown Manager",
          job_type_name: jobTypes?.find((jobType: any) => jobType.id === job.job_type_id)?.name || "Unknown Job Type",
          // New fields for multiple relationships
          campaign_ids: campaigns.map((c: any) => c.id),
          campaign_names: campaigns.map((c: any) => c.name),
          client_ids: uniqueClients.map((c: any) => c.id),
          client_names: uniqueClients.map((c: any) => c.name),
        };
      }) as Job[];
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
        .select(`
          *,
          job_campaigns(
            campaign_id,
            campaigns(id, name, client_id, clients(id, name))
          )
        `)
        .eq("id", jobId)
        .single();

      if (jobError) throw jobError;

      // Get provider and manager information
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

      // Transform job with campaign information
      const jobCampaigns = job.job_campaigns || [];
      const campaigns = jobCampaigns.map((jc: any) => jc.campaigns).filter(Boolean);
      const clients = campaigns.map((c: any) => c.clients).filter(Boolean);
      
      const uniqueClients = clients.reduce((acc: any[], client: any) => {
        if (!acc.find(c => c.id === client.id)) {
          acc.push(client);
        }
        return acc;
      }, []);

      return {
        ...job,
        campaign_name: campaigns[0]?.name || "Unknown Campaign",
        client_name: uniqueClients[0]?.name || "Unknown Client",
        provider_name: provider?.name || "Unknown Provider",
        manager_name: manager?.name || "Unknown Manager",
        campaign_ids: campaigns.map((c: any) => c.id),
        campaign_names: campaigns.map((c: any) => c.name),
        client_ids: uniqueClients.map((c: any) => c.id),
        client_names: uniqueClients.map((c: any) => c.name),
      } as Job;
    },
    enabled: !!jobId,
  });
};
