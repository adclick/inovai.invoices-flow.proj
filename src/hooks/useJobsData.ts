
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
      // Fetch all jobs
      const { data: jobs, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (jobsError) throw jobsError;

      // Fetch campaigns with their client information
      const { data: campaigns } = await supabase
        .from("campaigns")
        .select("id, name, client:client_id(id, name)");

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
      const campaignMap = campaigns?.reduce((acc: Record<string, any>, campaign) => {
        acc[campaign.id] = {
          name: campaign.name,
          client_name: campaign.client?.name || "Unknown Client"
        };
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
      return jobs.map((job: any) => ({
        ...job,
        campaign_name: campaignMap[job.campaign_id]?.name || "Unknown Campaign",
        client_name: campaignMap[job.campaign_id]?.client_name || "Unknown Client",
        provider_name: providerMap[job.provider_id] || "Unknown Provider",
        manager_name: managerMap[job.manager_id] || "Unknown Manager",
				job_type_name: jobTypes?.find((jobType: any) => jobType.id === job.job_type_id)?.name || "Unknown Job Type"
      })) as Job[];
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

      // Get associated campaign with client information
      const { data: campaign } = await supabase
        .from("campaigns")
        .select("name, client:client_id(name)")
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
        campaign_name: campaign?.name || "Unknown Campaign",
        client_name: campaign?.client?.name || "Unknown Client",
        provider_name: provider?.name || "Unknown Provider",
        manager_name: manager?.name || "Unknown Manager"
      } as Job;
    },
    enabled: !!jobId,
  });
};
