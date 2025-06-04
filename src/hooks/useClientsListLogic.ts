
import { useState, useMemo } from "react";
import { useClientsData } from "./useClientsData";
import { filterClients, paginateClients } from "@/utils/clientsListUtils";
import { ITEMS_PER_PAGE } from "@/utils/clientsListConstants";

export const useClientsListLogic = () => {
  const { data: clients, isLoading, error } = useClientsData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredClients = useMemo(() => {
    if (!clients) return [];
    return filterClients(clients, searchTerm, statusFilter);
  }, [clients, searchTerm, statusFilter]);

  const { paginatedClients, totalItems, totalPages } = useMemo(() => {
    return paginateClients(filteredClients, currentPage, ITEMS_PER_PAGE);
  }, [filteredClients, currentPage]);

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
    clients,
    paginatedClients,
    isLoading,
    error,
    searchTerm,
    setSearchTerm: handleSearchChange,
    statusFilter,
    setStatusFilter: handleStatusFilterChange,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
  };
};
