
import React from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import ClientsTableRow from "./ClientsTableRow";
import { Client } from "@/types/client";

interface ClientsTableProps {
  clients: Client[];
  onEditClient: (id: string) => void;
  onDeleteClick: (client: Client) => void;
  t: (key: string) => string;
}

const ClientsTable: React.FC<ClientsTableProps> = ({
  clients,
  onEditClient,
  onDeleteClick,
  t,
}) => {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
      <Table>
        <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
          <TableRow className="border-b border-slate-200 dark:border-slate-600">
            <TableHead className="font-semibold text-slate-700 dark:text-slate-200">{t("common.status")}</TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-200">{t("clients.clientName")}</TableHead>
            <TableHead className="w-[120px] text-right font-semibold text-slate-700 dark:text-slate-200">{t("common.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client, index) => (
            <ClientsTableRow
              key={client.id}
              client={client}
              onEditClient={onEditClient}
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

export default ClientsTable;
