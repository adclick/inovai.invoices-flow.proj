
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileSymlink, Trash2, Edit, ChevronDown, ChevronRight } from "lucide-react";
import { Job } from "@/types/job";
import { formatCurrency } from "@/hooks/useJobsData";
import { Badge } from "@/components/ui/badge";
import { JobStatusBadge } from "./JobStatusBadge";
import JobExpandedDetails from "./JobExpandedDetails";
import { formatDate } from "@/utils/jobsListUtils";

interface JobsTableRowProps {
  job: Job;
  onEditJob: (id: string) => void;
  onDeleteClick: (e: React.MouseEvent, job: Job) => void;
  isExpanded: boolean;
  onRowExpand: (jobId: string) => void;
  isEven: boolean;
  t: (key: string) => string;
}

const JobsTableRow: React.FC<JobsTableRowProps> = ({
  job,
  onEditJob,
  onDeleteClick,
  isExpanded,
  onRowExpand,
  isEven,
  t,
}) => {
  const handleRowClick = () => {
    onRowExpand(job.id);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditJob(job.id);
  };

  const rowBgClass = isEven 
    ? "bg-white dark:bg-slate-900" 
    : "bg-slate-50/30 dark:bg-slate-800/30";

  return (
    <>
      <TableRow 
        className={`cursor-pointer transition-all duration-200 border-b border-slate-100 dark:border-slate-700 ${rowBgClass} hover:bg-brand-light/5 dark:hover:bg-brand/10 hover:shadow-sm`} 
        onClick={handleRowClick}
      >
        <TableCell className="py-4">
          <div className="flex items-center gap-3">
            <div className="transition-transform duration-200">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-brand-dark dark:text-brand-light" />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-400 hover:text-brand" />
              )}
            </div>
            <JobStatusBadge status={job.status === 'paid' ? 'closed' : 'active'} />
          </div>
        </TableCell>
        <TableCell className="py-4 font-semibold text-slate-900 dark:text-slate-100">{job.name}</TableCell>
        <TableCell className="py-4 font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(job.value, job.currency)}</TableCell>
        <TableCell className="py-4 text-slate-600 dark:text-slate-300 font-mono text-sm">{new Date(job.created_at).toISOString().split('T')[0]} {new Date(job.created_at).toLocaleTimeString()}</TableCell>
        <TableCell className="text-right py-4">
          <div className="flex justify-end space-x-1">
            {job.documents && job.documents.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 text-slate-500 hover:text-brand hover:bg-brand/10 transition-colors" 
                onClick={(e) => e.stopPropagation()} 
              >
                <a href={job.documents[0]} target="_blank" rel="noopener noreferrer">
                  <FileSymlink className="h-4 w-4" />
                </a>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30 transition-colors"
              onClick={handleEditClick}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors"
              onClick={(e) => onDeleteClick(e, job)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow className={`${rowBgClass} border-b border-slate-100 dark:border-slate-700`}>
          <TableCell colSpan={6} className="p-0">
            <JobExpandedDetails job={job} t={t} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default JobsTableRow;
