
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";

export const useCompaniesData = () => {
  return useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data: companies, error } = await supabase
        .from("companies")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return companies as Company[];
    },
  });
};

export const useCompanyById = (companyId: string) => {
  return useQuery({
    queryKey: ["company", companyId],
    queryFn: async () => {
      if (!companyId) {
        throw new Error("Company ID is required");
      }

      const { data: company, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .single();

      if (error) throw error;
      return company as Company;
    },
    enabled: !!companyId,
  });
};
