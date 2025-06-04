
import { Job } from "@/types/job";

export const formatCurrency = (value: number, currency: string) => {
  const symbols: Record<string, string> = {
    euro: "€",
    usd: "$",
    gbp: "£"
  };

  const symbol = symbols[currency.toLowerCase()] || currency;
  return `${symbol}${value.toLocaleString()}`;
};

export const formatDate = (dateString?: string | null) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString();
};

export const filterJobs = (
  jobs: Job[],
  searchTerm: string,
  statusFilter: string,
  paymentFilter: string
) => {
  return jobs.filter((job) => {
    const matchesSearch = searchTerm === "" ||
      job.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.campaign_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.provider_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.manager_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.invoice_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesPayment = paymentFilter === "all" ||
      (paymentFilter === "paid") ||
      (paymentFilter === "pending");

    return matchesSearch && matchesStatus && matchesPayment;
  });
};

export const paginateJobs = (jobs: Job[], currentPage: number, itemsPerPage: number) => {
  const totalItems = jobs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedJobs = jobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return {
    paginatedJobs,
    totalItems,
    totalPages,
  };
};
