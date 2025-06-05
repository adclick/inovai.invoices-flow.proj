
import { useState, useMemo } from "react";
import { useCompaniesData } from "./useCompaniesData";
import { filterCompanies, paginateCompanies } from "@/utils/companiesListUtils";
import { ITEMS_PER_PAGE } from "@/utils/companiesListConstants";

export const useCompaniesListLogic = () => {
  const { data: companies, isLoading, error } = useCompaniesData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredCompanies = useMemo(() => {
    if (!companies) return [];
    return filterCompanies(companies, searchTerm, statusFilter);
  }, [companies, searchTerm, statusFilter]);

  const { paginatedCompanies, totalPages } = useMemo(() => {
    return paginateCompanies(filteredCompanies, currentPage, ITEMS_PER_PAGE);
  }, [filteredCompanies, currentPage]);

  return {
    companies,
    paginatedCompanies,
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
