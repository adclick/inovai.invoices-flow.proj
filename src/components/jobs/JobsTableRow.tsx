
import React from "react";
import { Link } from "react-router-dom";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { Job } from "@/types/job";
import JobStatusBadge from "./JobStatusBadge";
import { formatCurrency, formatDate } from "@/utils/jobsListUtils";

interface JobsTableRowProps {
  job: Job;
  onEditJob: (id: string) => void;
  onDeleteClick: (e: React.MouseEvent, job: Job) => void;
  t: (key: string) => string;
}

const JobsTableRow: React.FC<JobsTableRowProps> = ({
  job,
  onEditJob,
  onDeleteClick,
  t,
}) => {
  return (
    <TableRow onClick={() => onEditJob(job.id)} className="cursor-pointer">
      <TableCell>
        <JobStatusBadge status={job.status} t={t} />
      </TableCell>
      <TableCell>{job.job_type_name || t("jobs.unknownJobType")}</TableCell>
      <TableCell className="font-medium">{job.client_name || t("jobs.unknownClient")}</TableCell>
      <TableCell>{job.campaign_name || t("jobs.unknownCampaign")}</TableCell>
      <TableCell>{job.manager_name || t("jobs.unknownManager")}</TableCell>
      <TableCell>{job.provider_name || t("jobs.unknownProvider")}</TableCell>
      <TableCell>{job.months.map(month => t(`common.${month}`)).join(", ")}</TableCell>
      <TableCell>{formatCurrency(job.value, job.currency)}</TableCell>
      <TableCell>{formatDate(job.due_date) || t("jobs.unknownDate")}</TableCell>
      <TableCell>{formatDate(job.provider_email_sent) || <span className="text-slate-400 text-sm">-</span>}</TableCell>
      <TableCell className="w-2">
        {job.documents && job.documents.length > 0 ? (
          <Link to={job.documents[0]} onClick={e => e.stopPropagation()} target="_blank">
            <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800/30">
              Document
            </Badge>
          </Link>
        ) : (
          <span className="text-slate-400 text-sm">-</span>
        )}
      </TableCell>
      <TableCell>{job.invoice_reference || <span className="text-slate-400 text-sm">-</span>}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end space-x-2">
          <Link
            onClick={(e) => onDeleteClick(e, job)}
            to="#"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950/20"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">{t("common.delete")}</span>
          </Link>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default JobsTableRow;
