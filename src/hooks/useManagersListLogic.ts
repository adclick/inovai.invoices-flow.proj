
import { useState, useMemo } from "react";
import { useManagersData } from "./useManagersData";
import { filterManagers, paginateManagers } from "@/utils/managersListUtils";
import { ITEMS_PER_PAGE } from "@/utils/managersListConstants";

export const useManagersListLogic = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: managers, isLoading, error } = useManagersData();

  const filteredManagers = useMemo(() => {
    if (!managers) return [];
    return filterManagers(managers, searchTerm, statusFilter);
  }, [managers, searchTerm, statusFilter]);

  const { paginatedManagers, totalPages } = useMemo(() => {
    return paginateManagers(filteredManagers, currentPage, ITEMS_PER_PAGE);
  }, [filteredManagers, currentPage]);

  return {
    managers,
    paginatedManagers,
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
