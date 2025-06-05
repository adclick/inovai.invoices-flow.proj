import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Database } from "@/integrations/supabase/types";
import { ITEMS_PER_PAGE } from "@/utils/jobTypesListConstants";
import { paginateJobTypes } from "@/utils/jobTypesListUtils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type JobType = Database["public"]["Tables"]["job_types"]["Row"];

export const useJobTypesListLogic = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch job types data
  const { data: jobTypes, isLoading, error } = useQuery({
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
      return data as JobType[];
    },
  });

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (searchTerm) {
      newParams.set("search", searchTerm);
    } else {
      newParams.delete("search");
    }
    setSearchParams(newParams);
  }, [searchTerm, setSearchParams, searchParams]);

  const filteredJobTypes = useMemo(() => {
    return jobTypes?.filter((jobType) => {
      return jobType.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [jobTypes, searchTerm]);

  const { paginatedJobTypes, totalItems, totalPages } = useMemo(() => {
    return paginateJobTypes(filteredJobTypes || [], currentPage, ITEMS_PER_PAGE);
  }, [filteredJobTypes, currentPage]);

  return {
    paginatedJobTypes,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
  };
};
