
import { Provider } from "@/types/provider";

export const formatDate = (dateString?: string | null) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString();
};

export const filterProviders = (
  providers: Provider[],
  searchTerm: string,
  statusFilter: string
) => {
  return providers.filter((provider) => {
    const matchesSearch = searchTerm === "" ||
      provider.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && provider.active) ||
      (statusFilter === "inactive" && !provider.active);

    return matchesSearch && matchesStatus;
  });
};

export const paginateProviders = (providers: Provider[], currentPage: number, itemsPerPage: number) => {
  const totalItems = providers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedProviders = providers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return {
    paginatedProviders,
    totalItems,
    totalPages,
  };
};
