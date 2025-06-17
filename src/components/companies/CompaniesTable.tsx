
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
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
      <Table>
        <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
          <TableRow className="border-b border-slate-200 dark:border-slate-600">
            <TableHead className="font-semibold text-slate-700 dark:text-slate-200">{t("common.status")}</TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-200">{t("companies.name")}</TableHead>
            <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-200">{t("common.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company, index) => (
            <CompaniesTableRow
              key={company.id}
              company={company}
              onEdit={() => onEditCompany(company.id)}
              onDelete={() => onDeleteClick(company.id)}
              isEven={index % 2 === 0}
              t={t}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CompaniesTable;
