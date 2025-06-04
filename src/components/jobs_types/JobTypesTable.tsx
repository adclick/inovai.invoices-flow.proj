
import React from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import JobTypesTableRow from "./JobTypesTableRow";
import { Database } from "@/integrations/supabase/types";

type JobType = Database["public"]["Tables"]["job_types"]["Row"];

interface JobTypesTableProps {
  jobTypes: JobType[];
  onEditJobType: (id: string) => void;
  onDeleteClick: (jobType: JobType) => void;
  t: (key: string) => string;
}

const JobTypesTable: React.FC<JobTypesTableProps> = ({
  jobTypes,
  onEditJobType,
  onDeleteClick,
  t,
}) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("jobTypes.name")}</TableHead>
            <TableHead className="w-[120px] text-right">{t("common.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobTypes.map((jobType) => (
            <JobTypesTableRow
              key={jobType.id}
              jobType={jobType}
              onEditJobType={onEditJobType}
              onDeleteClick={onDeleteClick}
              t={t}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default JobTypesTable;
