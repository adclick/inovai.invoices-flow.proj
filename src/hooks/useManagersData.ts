
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Manager } from "@/types/manager";

export const useManagersData = () => {
  return useQuery({
    queryKey: ["managers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("managers")
        .select("*")
        .order("name");

      if (error) {
        throw new Error(error.message);
      }
      return data as unknown as Manager[];
    }
  });
};
