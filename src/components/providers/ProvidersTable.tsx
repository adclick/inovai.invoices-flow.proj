
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
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("common.status")}</TableHead>
            <TableHead>{t("providers.providerName")}</TableHead>
            <TableHead>{t("providers.email")}</TableHead>
            <TableHead>{t("providers.language")}</TableHead>
            <TableHead>{t("providers.country")}</TableHead>
            <TableHead className="w-[120px] text-right">{t("common.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {providers.map((provider) => (
            <ProvidersTableRow
              key={provider.id}
              provider={provider}
              onEditProvider={onEditProvider}
              onDeleteClick={onDeleteClick}
              t={t}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProvidersTable;
