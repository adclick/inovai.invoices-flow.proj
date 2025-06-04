
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
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("clients.clientName")}</TableHead>
            <TableHead>{t("common.status")}</TableHead>
            <TableHead className="w-[120px] text-right">{t("common.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <ClientsTableRow
              key={client.id}
              client={client}
              onEditClient={onEditClient}
              onDeleteClick={onDeleteClick}
              t={t}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientsTable;
