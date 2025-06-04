
import React from "react";
import { Input } from "@/components/ui/input";

interface JobTypesListFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
}

const JobTypesListFilters: React.FC<JobTypesListFiltersProps> = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1">
        <Input
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-md"
        />
      </div>
    </div>
  );
};

export default JobTypesListFilters;
