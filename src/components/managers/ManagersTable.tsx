
import React from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import ManagersTableRow from "./ManagersTableRow";
import { Manager } from "@/types/manager";

interface ManagersTableProps {
  managers: Manager[];
  onEditManager: (id: string) => void;
  onDeleteClick: (manager: Manager) => void;
  t: (key: string) => string;
}

const ManagersTable: React.FC<ManagersTableProps> = ({
  managers,
  onEditManager,
  onDeleteClick,
  t,
}) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("common.status")}</TableHead>
            <TableHead>{t("managers.name")}</TableHead>
            <TableHead>{t("common.email")}</TableHead>
            <TableHead className="w-[120px] text-right">{t("common.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {managers.map((manager) => (
            <ManagersTableRow
              key={manager.id}
              manager={manager}
              onEditManager={onEditManager}
              onDeleteClick={onDeleteClick}
              t={t}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ManagersTable;
