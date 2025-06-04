
import { Manager } from "@/types/manager";

export const formatDate = (dateString?: string | null) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString();
};

export const filterManagers = (
  managers: Manager[],
  searchTerm: string,
  statusFilter: string
) => {
  return managers.filter((manager) => {
    const matchesSearch = searchTerm === "" ||
      manager.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && manager.active) ||
      (statusFilter === "inactive" && !manager.active);

    return matchesSearch && matchesStatus;
  });
};

export const paginateManagers = (managers: Manager[], currentPage: number, itemsPerPage: number) => {
  const totalItems = managers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedManagers = managers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return {
    paginatedManagers,
    totalItems,
    totalPages,
  };
};
