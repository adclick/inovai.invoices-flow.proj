
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
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && jobType.active) ||
      (statusFilter === "inactive" && !jobType.active);

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
