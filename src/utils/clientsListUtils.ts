
import { Client } from "@/types/client";

export const formatDate = (dateString?: string | null) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString();
};

export const filterClients = (
  clients: Client[],
  searchTerm: string,
  statusFilter: string
) => {
  return clients.filter((client) => {
    const matchesSearch = searchTerm === "" ||
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && client.active) ||
      (statusFilter === "inactive" && !client.active);

    return matchesSearch && matchesStatus;
  });
};

export const paginateClients = (clients: Client[], currentPage: number, itemsPerPage: number) => {
  const totalItems = clients.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedClients = clients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return {
    paginatedClients,
    totalItems,
    totalPages,
  };
};
