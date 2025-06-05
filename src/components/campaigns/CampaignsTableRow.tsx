
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

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

interface CampaignsTableRowProps {
  campaign: Campaign;
  onEditCampaign: (id: string) => void;
  onDeleteClick: (campaign: Campaign) => void;
  t: (key: string) => string;
}

const CampaignsTableRow: React.FC<CampaignsTableRowProps> = ({
  campaign,
  onEditCampaign,
  onDeleteClick,
  t,
}) => {
  return (
    <TableRow className="cursor-pointer" onClick={() => onEditCampaign(campaign.id)}>
      <TableCell>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          campaign.active
            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
            : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
        }`}>
          {campaign.active ? t("common.active") : t("common.inactive")}
        </span>
      </TableCell>
      <TableCell>{campaign.client_name}</TableCell>
      <TableCell className="font-medium">{campaign.name}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            onClick={(e) => { 
              e.stopPropagation();
              onDeleteClick(campaign);
            }}
            variant="ghost"
            className="h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950/20"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">{t("common.delete")}</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default CampaignsTableRow;
