
import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Database } from "@/integrations/supabase/types";

type JobType = Database["public"]["Tables"]["job_types"]["Row"];

export const useJobTypesListLogic = (jobTypes: JobType[] | undefined) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set("search", value);
    } else {
      newParams.delete("search");
    }
    setSearchParams(newParams);
  };

  const filteredJobTypes = useMemo(() => {
    if (!jobTypes) return [];
    
    return jobTypes.filter((jobType) => {
      const matchesSearch = !searchTerm || 
        jobType.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [jobTypes, searchTerm]);

  return {
    searchTerm,
    handleSearchChange,
    filteredJobTypes,
  };
};
