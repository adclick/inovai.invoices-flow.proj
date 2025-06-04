
import { useState, useMemo } from "react";
import { filterJobTypes, paginateJobTypes } from "@/utils/jobTypesListUtils";
import { JOB_TYPES_ITEMS_PER_PAGE } from "@/utils/jobTypesListConstants";
import { Database } from "@/integrations/supabase/types";

type JobType = Database["public"]["Tables"]["job_types"]["Row"];

export const useJobTypesListLogic = (jobTypes: JobType[] = []) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredJobTypes = useMemo(() => {
    return filterJobTypes(jobTypes, searchTerm, statusFilter);
  }, [jobTypes, searchTerm, statusFilter]);

  const { paginatedJobTypes, totalPages } = useMemo(() => {
    return paginateJobTypes(filteredJobTypes, currentPage, JOB_TYPES_ITEMS_PER_PAGE);
  }, [filteredJobTypes, currentPage]);

  // Reset to first page when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  return {
    searchTerm,
    statusFilter,
    currentPage,
    filteredJobTypes,
    paginatedJobTypes,
    totalPages,
    handleSearchChange,
    handleStatusFilterChange,
    setCurrentPage,
  };
};
