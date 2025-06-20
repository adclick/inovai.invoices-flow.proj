import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
};

export default JobTypesListFilters;
