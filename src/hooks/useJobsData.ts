import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/types/job";

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
      // Fetch all jobs with their line items and companies
      const { data: jobs, error: jobsError } = await supabase
        .from("jobs")
        .select(`
          *,
          job_line_items(
            id,
            campaign_id,
            company_id,
            job_type_id,
            year,
            month,
            value,
            campaigns(id, name, client_id, clients(id, name)),
            companies(id, name, active),
            job_types(id, name)
          ),
          companies(id, name, active)
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

      // Create lookup tables for entity names
      const providerMap = providers?.reduce((acc: Record<string, string>, provider: any) => {
        acc[provider.id] = provider.name;
        return acc;
      }, {}) || {};

      const managerMap = managers?.reduce((acc: Record<string, string>, manager: any) => {
        acc[manager.id] = manager.name;
        return acc;
      }, {}) || {};

      // Transform jobs with line items information
      return jobs.map((job: any) => {
        const jobLineItems = job.job_line_items || [];
        const campaigns = jobLineItems.map((item: any) => item.campaigns).filter(Boolean);
        const clients = campaigns.map((c: any) => c.clients).filter(Boolean);
        
        // Get unique client information
        const uniqueClients = clients.reduce((acc: any[], client: any) => {
          if (!acc.find(c => c.id === client.id)) {
            acc.push(client);
          }
          return acc;
        }, []);

        // Create line items with complete information
        const lineItems = jobLineItems.map((item: any) => ({
          year: item.year,
          month: item.month,
          company_id: item.company_id,
          client_id: item.campaigns?.client_id,
          campaign_id: item.campaign_id,
          job_type_id: item.job_type_id,
          value: item.value,
          company_name: item.companies?.name || "No Company",
          client_name: item.campaigns?.clients?.name || "Unknown Client",
          campaign_name: item.campaigns?.name || "Unknown Campaign",
          job_type_name: item.job_types?.name || "Unknown Job Type",
        }));

        return {
          ...job,
          // Keep backward compatibility fields using first line item or fallback to job data
          campaign_name: campaigns[0]?.name || "Unknown Campaign",
          client_name: uniqueClients[0]?.name || "Unknown Client",
          provider_name: providerMap[job.provider_id] || "Unknown Provider",
          manager_name: managerMap[job.manager_id] || "Unknown Manager",
          job_type_name: jobLineItems[0]?.job_types?.name || "Unknown Job Type",
          company_name: job.companies?.name || jobLineItems[0]?.companies?.name || "No Company",
          // New fields for multiple relationships
          campaign_ids: campaigns.map((c: any) => c.id),
          campaign_names: campaigns.map((c: any) => c.name),
          client_ids: uniqueClients.map((c: any) => c.id),
          client_names: uniqueClients.map((c: any) => c.name),
          // Line items with complete data
          line_items: lineItems,
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
          job_line_items(
            id,
            campaign_id,
            company_id,
            job_type_id,
            year,
            month,
            value,
            campaigns(id, name, client_id, clients(id, name)),
            companies(id, name, active),
            job_types(id, name)
          ),
          companies(id, name, active)
        `)
        .eq("id", jobId as any)
        .single();

      if (jobError) throw jobError;

      // Get provider and manager information  
      const { data: provider } = await supabase
        .from("providers")
        .select("name")
        .eq("id", (job as any).provider_id)
        .single();

      const { data: manager } = await supabase
        .from("managers")
        .select("name")
        .eq("id", (job as any).manager_id)
        .single();

      // Transform job with line items information
      const jobLineItems = (job as any).job_line_items || [];
      const campaigns = jobLineItems.map((item: any) => item.campaigns).filter(Boolean);
      const clients = campaigns.map((c: any) => c.clients).filter(Boolean);
      
      const uniqueClients = clients.reduce((acc: any[], client: any) => {
        if (!acc.find(c => c.id === client.id)) {
          acc.push(client);
        }
        return acc;
      }, []);

      // Create line items with complete information
      const lineItems = jobLineItems.map((item: any) => ({
        year: item.year,
        month: item.month,
        company_id: item.company_id,
        client_id: item.campaigns?.client_id,
        campaign_id: item.campaign_id,
        job_type_id: item.job_type_id,
        value: item.value,
        company_name: item.companies?.name || "No Company",
        client_name: item.campaigns?.clients?.name || "Unknown Client",
        campaign_name: item.campaigns?.name || "Unknown Campaign",
        job_type_name: item.job_types?.name || "Unknown Job Type",
      }));

      return {
        ...(job as any),
        campaign_name: campaigns[0]?.name || "Unknown Campaign",
        client_name: uniqueClients[0]?.name || "Unknown Client",
        provider_name: (provider as any)?.name || "Unknown Provider",
        manager_name: (manager as any)?.name || "Unknown Manager",
        company_name: (job as any).companies?.name || jobLineItems[0]?.companies?.name || "No Company",
        campaign_ids: campaigns.map((c: any) => c.id),
        campaign_names: campaigns.map((c: any) => c.name),
        client_ids: uniqueClients.map((c: any) => c.id),
        client_names: uniqueClients.map((c: any) => c.name),
        line_items: lineItems,
      } as Job;
    },
    enabled: !!jobId,
  });
};
