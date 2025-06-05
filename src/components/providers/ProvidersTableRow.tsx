
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Mail, Trash2, Globe } from "lucide-react";
import { Provider } from "@/types/provider";

interface ProvidersTableRowProps {
  provider: Provider;
  onEditProvider: (id: string) => void;
  onDeleteClick: (provider: Provider) => void;
  t: (key: string) => string;
}

const ProvidersTableRow: React.FC<ProvidersTableRowProps> = ({
  provider,
  onEditProvider,
  onDeleteClick,
  t,
}) => {
  return (
    <TableRow 
      key={provider.id} 
      onClick={() => onEditProvider(provider.id)} 
      className="cursor-pointer"
    >
			<TableCell>
        <span className={`px-2 py-1 rounded-full text-xs ${provider.active 
          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
          : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
        }`}>
          {provider.active ? t("common.active") : t("common.inactive")}
        </span>
      </TableCell>
      <TableCell className="font-medium">{provider.name}</TableCell>
      <TableCell>
        <div className="flex items-center">
          <Mail className="h-4 w-4 mr-2 text-slate-400" />
          {provider.email}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <Globe className="h-4 w-4 mr-2 text-slate-400" />
          {provider.language.toUpperCase()}
        </div>
      </TableCell>
      <TableCell>
        {provider.country || "-"}
      </TableCell>
      
      <TableCell className="text-right">
        <div className="flex justify-end space-x-2">
          <a
            onClick={(e) => { e.stopPropagation(); onDeleteClick(provider); }}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950/20"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">{t("common.delete")}</span>
          </a>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ProvidersTableRow;
