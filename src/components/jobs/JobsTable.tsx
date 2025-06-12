
import React from "react";
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
  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("jobs.status")}</TableHead>
            <TableHead>{t("jobs.jobType")}</TableHead>
            <TableHead>{t("clients.title")}</TableHead>
            <TableHead>{t("campaigns.title")}</TableHead>
            <TableHead>{t("jobs.manager")}</TableHead>
            <TableHead>{t("jobs.provider")}</TableHead>
            <TableHead>{t("jobs.year")}</TableHead>
            <TableHead>{t("jobs.month")}</TableHead>
            <TableHead>{t("jobs.value")}</TableHead>
						<TableHead>{t("jobs.reference")}</TableHead>
						<TableHead>{t("jobs.providerEmailSent")}</TableHead>
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
              t={t}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default JobsTable;
