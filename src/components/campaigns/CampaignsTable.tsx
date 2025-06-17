
import React from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import CampaignsTableRow from "./CampaignsTableRow";

type Campaign = {
  id: string;
  name: string;
  active: boolean;
  client_id: string;
  client_name?: string;
  duration: number;
  estimated_cost: number | null;
  revenue: number | null;
  created_at: string;
};

interface CampaignsTableProps {
  campaigns: Campaign[];
  onEditCampaign: (id: string) => void;
  onDeleteClick: (campaign: Campaign) => void;
  t: (key: string) => string;
}

const CampaignsTable: React.FC<CampaignsTableProps> = ({
  campaigns,
  onEditCampaign,
  onDeleteClick,
  t,
}) => {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
      <Table>
        <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
          <TableRow className="border-b border-slate-200 dark:border-slate-600">
            <TableHead className="font-semibold text-slate-700 dark:text-slate-200">{t("common.status")}</TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-200">{t("campaigns.client")}</TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-200">{t("campaigns.campaignName")}</TableHead>
            <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-200">{t("common.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign, index) => (
            <CampaignsTableRow
              key={campaign.id}
              campaign={campaign}
              onEditCampaign={onEditCampaign}
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

export default CampaignsTable;
