
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
    <div className="rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("campaigns.client")}</TableHead>
            <TableHead>{t("campaigns.campaignName")}</TableHead>
            <TableHead>{t("common.status")}</TableHead>
            <TableHead className="text-right">{t("common.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <CampaignsTableRow
              key={campaign.id}
              campaign={campaign}
              onEditCampaign={onEditCampaign}
              onDeleteClick={onDeleteClick}
              t={t}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CampaignsTable;
