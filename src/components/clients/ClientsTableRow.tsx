
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { Client } from "@/types/client";

interface ClientsTableRowProps {
  client: Client;
  onEditClient: (id: string) => void;
  onDeleteClick: (client: Client) => void;
  t: (key: string) => string;
}

const ClientsTableRow: React.FC<ClientsTableRowProps> = ({
  client,
  onEditClient,
  onDeleteClick,
  t,
}) => {
  return (
    <TableRow 
      onClick={() => onEditClient(client.id)} 
      className="cursor-pointer"
    >
      <TableCell className="font-medium">{client.name}</TableCell>
      <TableCell>
        <span className={`px-2 py-1 rounded-full text-xs ${client.active 
            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
            : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
          }`}>
          {client.active ? t("common.active") : t("common.inactive")}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end space-x-2">
          <Link
            onClick={e =>{ e.stopPropagation(); onDeleteClick(client)}}
            to="#"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950/20"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">{t("common.delete")}</span>
          </Link>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ClientsTableRow;
