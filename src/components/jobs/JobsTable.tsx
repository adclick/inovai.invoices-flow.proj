
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Job } from "@/types/job";
import JobsTableRow from "./JobsTableRow";

interface JobsTableProps {
  jobs: Job[];
  onEditJob: (id: string) => void;
  onDeleteClick: (e: React.MouseEvent, job: Job) => void;
  t: (key: string) => string;
}

const JobsTable: React.FC<JobsTableProps> = ({
  jobs,
  onEditJob,
  onDeleteClick,
  t,
}) => {
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const handleRowExpand = (jobId: string) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
      <Table>
        <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
          <TableRow className="border-b border-slate-200 dark:border-slate-600">
            <TableHead className="font-semibold text-slate-700 dark:text-slate-200">{t("jobs.status")}</TableHead>
						<TableHead className="font-semibold text-slate-700 dark:text-slate-200">{t("jobs.name")}</TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-200">{t("jobs.value")}</TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-200">{t("jobs.createdAt")}</TableHead>
            <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-200">{t("jobs.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job, index) => (
            <JobsTableRow
              key={job.id}
              job={job}
              onEditJob={onEditJob}
              onDeleteClick={onDeleteClick}
              isExpanded={expandedJobId === job.id}
              onRowExpand={handleRowExpand}
              isEven={index % 2 === 0}
              t={t}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default JobsTable;
