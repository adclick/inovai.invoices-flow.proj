
import { Database } from "@/integrations/supabase/types";

type JobType = Database["public"]["Tables"]["job_types"]["Row"];

export const filterJobTypes = (
  jobTypes: JobType[],
  searchTerm: string,
  statusFilter: string
): JobType[] => {
  if (!jobTypes) return [];

  return jobTypes.filter((jobType) => {
    const matchesSearch = jobType.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase()) ?? false;

    // Since job_types table doesn't have an 'active' column, we'll treat all as active
    // or we can remove status filtering for job types
    const matchesStatus = statusFilter === "all" || statusFilter === "active";

    return matchesSearch && matchesStatus;
  });
};

export const paginateJobTypes = (
  jobTypes: JobType[],
  currentPage: number,
  itemsPerPage: number
): { paginatedJobTypes: JobType[]; totalPages: number } => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedJobTypes = jobTypes.slice(startIndex, endIndex);
  const totalPages = Math.ceil(jobTypes.length / itemsPerPage);

  return { paginatedJobTypes, totalPages };
};
