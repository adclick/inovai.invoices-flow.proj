
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface JobsListHeaderProps {
  title: string;
  createButtonText: string;
  onCreateJob: () => void;
}

const JobsListHeader: React.FC<JobsListHeaderProps> = ({
  title,
  createButtonText,
  onCreateJob,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h1>
      <Button onClick={onCreateJob} className="shrink-0">
        <PlusCircle className="mr-2 h-4 w-4" />
        {createButtonText}
      </Button>
    </div>
  );
};

export default JobsListHeader;
