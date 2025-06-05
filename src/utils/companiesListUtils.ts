
import { Company } from "@/types/company";

export const filterCompanies = (companies: Company[], searchTerm: string, statusFilter: string) => {
  return companies.filter((company) => {
    const matchesSearch = !searchTerm || 
      company.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && company.active) ||
      (statusFilter === "inactive" && !company.active);
    
    return matchesSearch && matchesStatus;
  });
};

export const paginateCompanies = (companies: Company[], currentPage: number, itemsPerPage: number) => {
  const totalItems = companies.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedCompanies = companies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  return { paginatedCompanies, totalItems, totalPages };
};
