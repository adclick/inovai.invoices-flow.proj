
import { Database } from "@/integrations/supabase/types";

type JobType = Database["public"]["Tables"]["job_types"]["Row"];

export const filterJobTypes = (jobTypes: JobType[], searchTerm: string) => {
  return jobTypes.filter((jobType) => {
    const matchesSearch = !searchTerm || 
      jobType.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });
};

export const paginateJobTypes = (jobTypes: JobType[], currentPage: number, itemsPerPage: number) => {
  const totalItems = jobTypes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedJobTypes = jobTypes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  return { paginatedJobTypes, totalItems, totalPages };
};