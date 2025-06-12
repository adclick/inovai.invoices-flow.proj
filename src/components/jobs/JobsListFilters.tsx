
import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_FILTER_OPTIONS } from "@/utils/jobsListConstants";
import { Search } from "lucide-react";

interface JobsListFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  searchPlaceholder: string;
  filterByStatusText: string;
  t: (key: string) => string;
}

const JobsListFilters: React.FC<JobsListFiltersProps> = ({
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
			<div className="flex flex-row gap-2">
				<Select value={statusFilter} onValueChange={onStatusFilterChange}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder={filterByStatusText} />
					</SelectTrigger>
					<SelectContent>
						{STATUS_FILTER_OPTIONS.map((option) => (
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

export default JobsListFilters;
