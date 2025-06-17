
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileSymlink, Trash2, Edit, ChevronDown, ChevronRight } from "lucide-react";
import { Job } from "@/types/job";
import { formatCurrency } from "@/hooks/useJobsData";
import { Badge } from "@/components/ui/badge";
import JobStatusBadge from "./JobStatusBadge";
import JobExpandedDetails from "./JobExpandedDetails";

interface JobsTableRowProps {
  job: Job;
  onEditJob: (id: string) => void;
  onDeleteClick: (e: React.MouseEvent, job: Job) => void;
  isExpanded: boolean;
  onRowExpand: (jobId: string) => void;
  t: (key: string) => string;
}

const JobsTableRow: React.FC<JobsTableRowProps> = ({
  job,
  onEditJob,
  onDeleteClick,
  isExpanded,
  onRowExpand,
  t,
}) => {
  const handleRowClick = () => {
    onRowExpand(job.id);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditJob(job.id);
  };

  return (
    <>
      <TableRow className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50" onClick={handleRowClick}>
        <TableCell>
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-400" />
            )}
            <JobStatusBadge status={job.status} t={t} />
          </div>
        </TableCell>
        <TableCell>{job.job_type_name}</TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <span>{job.client_names?.length || 1}</span>
            {job.client_names && job.client_names.length > 1 && (
              <Badge variant="secondary" className="text-xs">
                +{job.client_names.length - 1}
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <span>{job.campaign_names?.length || 1}</span>
            {job.campaign_names && job.campaign_names.length > 1 && (
              <Badge variant="secondary" className="text-xs">
                +{job.campaign_names.length - 1}
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell>{job.manager_name}</TableCell>
        <TableCell>{job.provider_name}</TableCell>
        <TableCell>{formatCurrency(job.value, job.currency)}</TableCell>
        <TableCell>{job.invoice_reference}</TableCell>
        <TableCell>{job.provider_email_sent}</TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end space-x-2">
            {job.documents && job.documents.length > 0 && (
              <Button 
                variant="ghost" 
                className="h-9 px-3 text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-400" 
                onClick={(e) => e.stopPropagation()} 
              >
                <a href={job.documents[0]} target="_blank" rel="noopener noreferrer">
                  <FileSymlink className="h-4 w-4" />
                </a>
              </Button>
            )}
            <Button
              variant="ghost"
              className="h-9 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-500 dark:hover:bg-blue-950/20"
              onClick={handleEditClick}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className="h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950/20"
              onClick={(e) => onDeleteClick(e, job)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={10} className="p-0">
            <JobExpandedDetails job={job} t={t} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default JobsTableRow;
