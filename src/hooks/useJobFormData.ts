
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useEntitiesQuery } from "@/hooks/useEntityQuery";
import { EntitySelectOption, JOB_STATUS_OPTIONS, MONTH_OPTIONS } from "@/utils/formConstants";

export const useJobFormData = () => {
  const { t } = useTranslation();

  // Fetch all required data
  const { data: clientsData, isLoading: clientsLoading } = useEntitiesQuery("clients", {
    select: "id, name",
    orderBy: "name",
  });

  const { data: campaignsData, isLoading: campaignsLoading } = useEntitiesQuery("campaigns", {
    select: "id, name, client_id",
    orderBy: "name",
  });

  const { data: providersData, isLoading: providersLoading } = useEntitiesQuery("providers", {
    select: "id, name",
    filters: { active: true },
    orderBy: "name",
  });

  const { data: managersData, isLoading: managersLoading } = useEntitiesQuery("managers", {
    select: "id, name",
    filters: { active: true },
    orderBy: "name",
  });

  const { data: jobTypesData, isLoading: jobTypesLoading } = useEntitiesQuery("job_types", {
    select: "id, name",
    orderBy: "name",
  });

  // Transform data to expected format
  const clients = useMemo((): EntitySelectOption[] => {
    if (!clientsData || !Array.isArray(clientsData)) return [];
    return clientsData.map((client: any) => ({
      id: client.id,
      name: client.name,
    }));
  }, [clientsData]);

  const campaigns = useMemo(() => {
    if (!campaignsData || !Array.isArray(campaignsData)) return [];
    return campaignsData.map((campaign: any) => ({
      id: campaign.id,
      name: campaign.name,
      client_id: campaign.client_id,
    }));
  }, [campaignsData]);

  const providers = useMemo((): EntitySelectOption[] => {
    if (!providersData || !Array.isArray(providersData)) return [];
    return providersData.map((provider: any) => ({
      id: provider.id,
      name: provider.name,
    }));
  }, [providersData]);

  const managers = useMemo((): EntitySelectOption[] => {
    if (!managersData || !Array.isArray(managersData)) return [];
    return managersData.map((manager: any) => ({
      id: manager.id,
      name: manager.name,
    }));
  }, [managersData]);

  const jobTypes = useMemo((): EntitySelectOption[] => {
    if (!jobTypesData || !Array.isArray(jobTypesData)) return [];
    return jobTypesData.map((jobType: any) => ({
      id: jobType.id,
      name: jobType.name,
    }));
  }, [jobTypesData]);

  // Translate status and month options
  const statusOptions = useMemo(() => 
    JOB_STATUS_OPTIONS.map(option => ({
      value: option.value,
      label: t(option.label),
    })), [t]
  );

  const monthOptions = useMemo(() => 
    MONTH_OPTIONS.map(option => ({
      value: option.value,
      label: t(option.label),
    })), [t]
  );

  const isLoading = clientsLoading || campaignsLoading || providersLoading || managersLoading || jobTypesLoading;

  return {
    clients,
    campaigns,
    providers,
    managers,
    jobTypes,
    statusOptions,
    monthOptions,
    isLoading,
  };
};
