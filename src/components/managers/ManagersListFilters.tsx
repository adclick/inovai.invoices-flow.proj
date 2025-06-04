
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MANAGER_STATUS_OPTIONS } from "@/utils/managersListConstants";

interface ManagersListFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  searchPlaceholder: string;
  filterByStatusText: string;
  t: (key: string) => string;
}

const ManagersListFilters: React.FC<ManagersListFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  searchPlaceholder,
  filterByStatusText,
  t,
}) => {
  return (
    <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
      <div className="flex-1">
        <Input
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="w-full sm:w-48">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder={filterByStatusText} />
          </SelectTrigger>
          <SelectContent>
            {MANAGER_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {t(option.label)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ManagersListFilters;
