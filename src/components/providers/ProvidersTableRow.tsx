
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Mail, Edit, Trash2, Globe } from "lucide-react";
import { Provider } from "@/types/provider";

interface ProvidersTableRowProps {
  provider: Provider;
  onEditProvider: (id: string) => void;
  onDeleteClick: (provider: Provider) => void;
  isEven: boolean;
  t: (key: string) => string;
}

const ProvidersTableRow: React.FC<ProvidersTableRowProps> = ({
  provider,
  onEditProvider,
  onDeleteClick,
  isEven,
  t,
}) => {
  const rowBgClass = isEven 
    ? "bg-white dark:bg-slate-900" 
    : "bg-slate-50/30 dark:bg-slate-800/30";

  return (
    <TableRow 
      key={provider.id} 
      onClick={() => onEditProvider(provider.id)} 
      className={`cursor-pointer transition-all duration-200 border-b border-slate-100 dark:border-slate-700 ${rowBgClass} hover:bg-brand-light/5 dark:hover:bg-brand/10 hover:shadow-sm`}
    >
      <TableCell className="py-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${provider.active 
          ? "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700" 
          : "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700"
        }`}>
          {provider.active ? t("common.active") : t("common.inactive")}
        </span>
      </TableCell>
      <TableCell className="py-4 font-semibold text-slate-900 dark:text-slate-100">{provider.name}</TableCell>
      <TableCell className="py-4">
        <div className="flex items-center text-slate-600 dark:text-slate-300">
          <Mail className="h-4 w-4 mr-2 text-slate-400" />
          {provider.email}
        </div>
      </TableCell>
      <TableCell className="py-4">
        <div className="flex items-center text-slate-600 dark:text-slate-300">
          <Globe className="h-4 w-4 mr-2 text-slate-400" />
          {provider.language?.toUpperCase() || "-"}
        </div>
      </TableCell>
      <TableCell className="py-4 text-slate-600 dark:text-slate-300">
        {provider.country || "-"}
      </TableCell>
      
      <TableCell className="text-right py-4">
        <div className="flex justify-end space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30 transition-colors"
            onClick={(e) => { e.stopPropagation(); onEditProvider(provider.id); }}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">{t("common.edit")}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors"
            onClick={(e) => { e.stopPropagation(); onDeleteClick(provider); }}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">{t("common.delete")}</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ProvidersTableRow;
