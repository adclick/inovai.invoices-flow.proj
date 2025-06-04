
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Database } from "@/integrations/supabase/types";
import JobTypesTableRow from "./JobTypesTableRow";

type JobType = Database["public"]["Tables"]["job_types"]["Row"];

interface JobTypesTableProps {
  jobTypes: JobType[];
  onEditJobType: (id: string) => void;
  onDeleteJobType: (jobType: JobType) => void;
}

const JobTypesTable: React.FC<JobTypesTableProps> = ({
  jobTypes,
  onEditJobType,
  onDeleteJobType,
}) => {
  const { t } = useTranslation();

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
              onEdit={() => onEditJobType(jobType.id)}
              onDelete={() => onDeleteJobType(jobType)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default JobTypesTable;
