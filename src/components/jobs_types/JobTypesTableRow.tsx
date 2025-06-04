
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type JobType = Database["public"]["Tables"]["job_types"]["Row"];

interface JobTypesTableRowProps {
  jobType: JobType;
  onEditJobType: (id: string) => void;
  onDeleteClick: (jobType: JobType) => void;
  t: (key: string) => string;
}

const JobTypesTableRow: React.FC<JobTypesTableRowProps> = ({
  jobType,
  onEditJobType,
  onDeleteClick,
  t,
}) => {
  return (
    <TableRow 
      className="cursor-pointer" 
      onClick={() => onEditJobType(jobType.id)}
    >
      <TableCell className="font-medium">
        {jobType.name}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => { 
              e.stopPropagation(); 
              onDeleteClick(jobType); 
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950/20"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">{t("common.delete")}</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default JobTypesTableRow;
