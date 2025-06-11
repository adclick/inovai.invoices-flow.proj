
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { Company } from "@/types/company";
import { format } from "date-fns";

interface CompaniesTableRowProps {
  company: Company;
  onEdit: () => void;
  onDelete: () => void;
  t: (key: string) => string;
}

const CompaniesTableRow: React.FC<CompaniesTableRowProps> = ({
  company,
  onEdit,
  onDelete,
  t,
}) => {
  return (
    <TableRow className="cursor-pointer" onClick={onEdit}>
      
			<TableCell>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          company.active
            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
            : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
        }`}>
          {company.active ? t("common.active") : t("common.inactive")}
        </span>
      </TableCell>
			<TableCell className="font-medium">{company.name}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end space-x-2">
          <Button variant="ghost" className="h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950/20" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default CompaniesTableRow;
