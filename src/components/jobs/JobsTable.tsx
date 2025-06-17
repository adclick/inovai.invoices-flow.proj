
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
    <div className="rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("jobs.status")}</TableHead>
            <TableHead>{t("jobs.manager")}</TableHead>
            <TableHead>{t("jobs.provider")}</TableHead>
            <TableHead>{t("jobs.value")}</TableHead>
						<TableHead>{t("jobs.createdAt")}</TableHead>
            <TableHead className="text-right">{t("jobs.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <JobsTableRow
              key={job.id}
              job={job}
              onEditJob={onEditJob}
              onDeleteClick={onDeleteClick}
              isExpanded={expandedJobId === job.id}
              onRowExpand={handleRowExpand}
              t={t}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default JobsTable;
