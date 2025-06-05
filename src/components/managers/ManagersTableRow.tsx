
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Manager } from "@/types/manager";

interface ManagersTableRowProps {
  manager: Manager;
  onEditManager: (id: string) => void;
  onDeleteClick: (manager: Manager) => void;
  t: (key: string) => string;
}

const ManagersTableRow: React.FC<ManagersTableRowProps> = ({
  manager,
  onEditManager,
  onDeleteClick,
  t,
}) => {
  return (
    <TableRow 
      key={manager.id} 
      onClick={() => onEditManager(manager.id)} 
      className="cursor-pointer"
    >
			<TableCell>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          manager.active
            ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300"
            : "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300"
        }`}>
          {manager.active ? t("common.active") : t("common.inactive")}
        </span>
      </TableCell>
      <TableCell className="font-medium">
        {manager.name}
      </TableCell>
      <TableCell>
        {manager.email}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end space-x-2">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={(e) => { e.stopPropagation(); onEditManager(manager.id);}}
            className="hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">{t("common.edit")}</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); onDeleteClick(manager); }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950/20"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">{t("common.delete")}</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ManagersTableRow;
