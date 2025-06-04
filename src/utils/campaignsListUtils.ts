
import { Campaign } from "@/types/campaign";

export const formatCurrency = (value: number | null, currency: string = "EUR") => {
  if (value === null) return "-";
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(value);
};

export const formatDate = (dateString?: string | null) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString();
};

export const filterCampaigns = (
  campaigns: Campaign[],
  searchTerm: string,
  statusFilter: string
) => {
  return campaigns.filter((campaign) => {
    const matchesSearch = searchTerm === "" ||
      campaign.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && campaign.active) ||
      (statusFilter === "inactive" && !campaign.active);

    return matchesSearch && matchesStatus;
  });
};

export const paginateCampaigns = (campaigns: Campaign[], currentPage: number, itemsPerPage: number) => {
  const totalItems = campaigns.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedCampaigns = campaigns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return {
    paginatedCampaigns,
    totalItems,
    totalPages,
  };
};
