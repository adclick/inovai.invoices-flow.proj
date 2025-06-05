
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CompaniesListHeaderProps {
  title: string;
  createButtonText: string;
  onCreateCompany: () => void;
}

const CompaniesListHeader: React.FC<CompaniesListHeaderProps> = ({
  title,
  createButtonText,
  onCreateCompany,
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">{title}</h1>
      <Button onClick={onCreateCompany}>
        <Plus className="mr-2 h-4 w-4" />
        {createButtonText}
      </Button>
    </div>
  );
};

export default CompaniesListHeader;
