
import React from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Company } from "@/types/company";
import CompaniesTableRow from "./CompaniesTableRow";

interface CompaniesTableProps {
  companies: Company[];
  onEditCompany: (id: string) => void;
  onDeleteClick: (id: string) => void;
  t: (key: string) => string;
}

const CompaniesTable: React.FC<CompaniesTableProps> = ({
  companies,
  onEditCompany,
  onDeleteClick,
  t,
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("companies.name")}</TableHead>
            <TableHead>{t("common.status")}</TableHead>
            <TableHead>{t("common.createdAt")}</TableHead>
            <TableHead className="text-right">{t("common.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <CompaniesTableRow
              key={company.id}
              company={company}
              onEdit={() => onEditCompany(company.id)}
              onDelete={() => onDeleteClick(company.id)}
              t={t}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CompaniesTable;
