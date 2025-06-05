
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import OptionalSelectField from "@/components/common/form/OptionalSelectField";
import { STATUS_FILTER_OPTIONS } from "@/utils/companiesListConstants";

interface CompaniesListFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  searchPlaceholder: string;
  filterByStatusText: string;
  t: (key: string) => string;
}

const CompaniesListFilters: React.FC<CompaniesListFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  searchPlaceholder,
  filterByStatusText,
  t,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="md:w-48">
        <OptionalSelectField
          control={{} as any}
          name="statusFilter"
          label=""
          placeholder={filterByStatusText}
          options={STATUS_FILTER_OPTIONS}
          t={t}
          onValueChange={onStatusFilterChange}
        />
      </div>
    </div>
  );
};

export default CompaniesListFilters;
