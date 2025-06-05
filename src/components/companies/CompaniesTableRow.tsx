
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
    <TableRow>
      <TableCell className="font-medium">{company.name}</TableCell>
      <TableCell>
        <Badge variant={company.active ? "default" : "secondary"}>
          {company.active ? t("common.active") : t("common.inactive")}
        </Badge>
      </TableCell>
      <TableCell>
        {format(new Date(company.created_at), "MMM dd, yyyy")}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default CompaniesTableRow;
