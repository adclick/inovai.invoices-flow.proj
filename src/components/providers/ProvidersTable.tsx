
import React from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import ProvidersTableRow from "./ProvidersTableRow";
import { Provider } from "@/types/provider";

interface ProvidersTableProps {
  providers: Provider[];
  onEditProvider: (id: string) => void;
  onDeleteClick: (provider: Provider) => void;
  t: (key: string) => string;
}

const ProvidersTable: React.FC<ProvidersTableProps> = ({
  providers,
  onEditProvider,
  onDeleteClick,
  t,
}) => {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
      <Table>
        <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
          <TableRow className="border-b border-slate-200 dark:border-slate-600">
            <TableHead className="font-semibold text-slate-700 dark:text-slate-200">{t("common.status")}</TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-200">{t("providers.providerName")}</TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-200">{t("providers.email")}</TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-200">{t("providers.language")}</TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-200">{t("providers.country")}</TableHead>
            <TableHead className="w-[120px] text-right font-semibold text-slate-700 dark:text-slate-200">{t("common.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {providers.map((provider, index) => (
            <ProvidersTableRow
              key={provider.id}
              provider={provider}
              onEditProvider={onEditProvider}
              onDeleteClick={onDeleteClick}
              isEven={index % 2 === 0}
              t={t}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProvidersTable;
