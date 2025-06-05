
import React from "react";
import { Button } from "@/components/ui/button";
import { Building2, Plus } from "lucide-react";

interface CompaniesEmptyStateProps {
  title: string;
  description: string;
  createButtonText: string;
  onCreateCompany: () => void;
}

const CompaniesEmptyState: React.FC<CompaniesEmptyStateProps> = ({
  title,
  description,
  createButtonText,
  onCreateCompany,
}) => {
  return (
    <div className="text-center py-12">
      <Building2 className="mx-auto h-12 w-12 text-slate-400" />
      <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
      <div className="mt-6">
        <Button onClick={onCreateCompany}>
          <Plus className="mr-2 h-4 w-4" />
          {createButtonText}
        </Button>
      </div>
    </div>
  );
};

export default CompaniesEmptyState;
