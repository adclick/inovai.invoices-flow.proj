
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type JobType = Database["public"]["Tables"]["job_types"]["Row"];

export const useJobTypesData = () => {
  return useQuery({
    queryKey: ["jobTypes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_types")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching job types:", error.message);
        throw error;
      }
      return data as unknown as JobType[];
    },
  });
};
