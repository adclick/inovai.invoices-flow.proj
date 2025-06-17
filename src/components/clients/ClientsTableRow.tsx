
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { Client } from "@/types/client";

interface ClientsTableRowProps {
  client: Client;
  onEditClient: (id: string) => void;
  onDeleteClick: (client: Client) => void;
  isEven: boolean;
  t: (key: string) => string;
}

const ClientsTableRow: React.FC<ClientsTableRowProps> = ({
  client,
  onEditClient,
  onDeleteClick,
  isEven,
  t,
}) => {
  const rowBgClass = isEven 
    ? "bg-white dark:bg-slate-900" 
    : "bg-slate-50/30 dark:bg-slate-800/30";

  return (
    <TableRow 
      onClick={() => onEditClient(client.id)} 
      className={`cursor-pointer transition-all duration-200 border-b border-slate-100 dark:border-slate-700 ${rowBgClass} hover:bg-brand-light/5 dark:hover:bg-brand/10 hover:shadow-sm`}
    >
      <TableCell className="py-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${client.active 
            ? "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700" 
            : "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700"
          }`}>
          {client.active ? t("common.active") : t("common.inactive")}
        </span>
      </TableCell>
      <TableCell className="py-4 font-semibold text-slate-900 dark:text-slate-100">{client.name}</TableCell>
      <TableCell className="text-right py-4">
        <div className="flex justify-end space-x-2">
          <Link
            onClick={e =>{ e.stopPropagation(); onDeleteClick(client)}}
            to="#"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
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
