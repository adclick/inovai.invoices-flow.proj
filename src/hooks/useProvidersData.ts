
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Provider } from "@/types/provider";

export const useProvidersData = () => {
  return useQuery({
    queryKey: ["providers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("providers")
        .select("*")
        .order("name");

      if (error) {
        throw new Error(error.message);
      }
      return data as Provider[];
    }
  });
};
