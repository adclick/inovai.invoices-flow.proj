
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface JobsEmptyStateProps {
  title: string;
  description: string;
  createButtonText: string;
  onCreateJob: () => void;
}

const JobsEmptyState: React.FC<JobsEmptyStateProps> = ({
  title,
  description,
  createButtonText,
  onCreateJob,
}) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 mb-4">{description}</p>
      <Button onClick={onCreateJob}>
        <PlusCircle className="mr-2 h-4 w-4" />
        {createButtonText}
      </Button>
    </div>
  );
};

export default JobsEmptyState;
