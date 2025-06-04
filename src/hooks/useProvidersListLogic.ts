
import { useState, useMemo } from "react";
import { useProvidersData } from "./useProvidersData";
import { filterProviders, paginateProviders } from "@/utils/providersListUtils";
import { ITEMS_PER_PAGE } from "@/utils/providersListConstants";

export const useProvidersListLogic = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: providers, isLoading, error } = useProvidersData();

  const filteredProviders = useMemo(() => {
    if (!providers) return [];
    return filterProviders(providers, searchTerm, statusFilter);
  }, [providers, searchTerm, statusFilter]);

  const { paginatedProviders, totalPages } = useMemo(() => {
    return paginateProviders(filteredProviders, currentPage, ITEMS_PER_PAGE);
  }, [filteredProviders, currentPage]);

  return {
    providers,
    paginatedProviders,
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
