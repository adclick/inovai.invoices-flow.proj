
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useJobsData } from "@/hooks/useJobsData";
import { filterJobs, paginateJobs } from "@/utils/jobsListUtils";
import { ITEMS_PER_PAGE } from "@/utils/jobsListConstants";

export const useJobsListLogic = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  
  // Get company filter from URL params
  const companyFilter = searchParams.get("company") || "";

  // Update URL when search term changes
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (searchTerm) {
      newParams.set("search", searchTerm);
    } else {
      newParams.delete("search");
    }
    setSearchParams(newParams);
  }, [searchTerm, setSearchParams, searchParams]);

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, paymentFilter, companyFilter]);

  // Fetch jobs data
  const { data: jobs, isLoading, error } = useJobsData();

  // Filter and paginate jobs
  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    
    let filtered = filterJobs(jobs, searchTerm, statusFilter, paymentFilter);
    
    // Apply company filter if specified
    if (companyFilter) {
      filtered = filtered.filter(job => job.company_id === companyFilter);
    }
    
    return filtered;
  }, [jobs, searchTerm, statusFilter, paymentFilter, companyFilter]);

  const { paginatedJobs, totalItems, totalPages } = useMemo(() => {
    return paginateJobs(filteredJobs, currentPage, ITEMS_PER_PAGE);
  }, [filteredJobs, currentPage]);

  return {
    jobs,
    paginatedJobs,
    filteredJobs,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    paymentFilter,
    setPaymentFilter,
    currentPage,
    setCurrentPage,
    totalItems,
    totalPages,
    companyFilter,
  };
};
