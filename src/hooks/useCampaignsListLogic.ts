
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useCampaignsData } from "@/hooks/useCampaignsData";
import { filterCampaigns, paginateCampaigns } from "@/utils/campaignsListUtils";
import { ITEMS_PER_PAGE } from "@/utils/campaignsListConstants";

export const useCampaignsListLogic = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Update URL when search term changes
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (searchTerm) {
      newParams.set("search", searchTerm);
    } else {
      newParams.delete("search");
    }
    setSearchParams(newParams);
  }, [searchTerm, setSearchParams, searchParams]);

  // Fetch campaigns data
  const { data: campaigns, isLoading, error } = useCampaignsData();

  // Filter and paginate campaigns
  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];
    return filterCampaigns(campaigns, searchTerm, statusFilter);
  }, [campaigns, searchTerm, statusFilter]);

  const { paginatedCampaigns, totalItems, totalPages } = useMemo(() => {
    return paginateCampaigns(filteredCampaigns, currentPage, ITEMS_PER_PAGE);
  }, [filteredCampaigns, currentPage]);

  return {
    campaigns,
    paginatedCampaigns,
    filteredCampaigns,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalItems,
    totalPages,
  };
};
