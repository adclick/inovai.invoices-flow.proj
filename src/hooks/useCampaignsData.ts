
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

type Campaign = {
  id: string;
  name: string;
  active: boolean;
  client_id: string;
  client_name?: string;
  duration: number;
  estimated_cost: number | null;
  revenue: number | null;
  created_at: string;
};

export const useCampaignsData = () => {
  const { t } = useTranslation();

  return useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      // First fetch all campaigns
      const { data: campaigns, error: campaignsError } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (campaignsError) throw campaignsError;

      // Fetch all clients to get their names
      const { data: clients, error: clientsError } = await supabase
        .from("clients")
        .select("id, name");

      if (clientsError) throw clientsError;

      // Create a lookup table for client names
      const clientMap = clients.reduce((acc: Record<string, string>, client) => {
        acc[client.id] = client.name;
        return acc;
      }, {});

      // Add client names to campaigns
      return campaigns.map((campaign: Campaign) => ({
        ...campaign,
        client_name: clientMap[campaign.client_id] || t("campaigns.unknownClient")
      }));
    },
  });
};
