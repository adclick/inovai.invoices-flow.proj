
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Campaign } from "@/types/campaign";


interface CampaignsTableRowProps {
	campaign: Campaign;
	onEditCampaign: (id: string) => void;
	onDeleteClick: (campaign: Campaign) => void;
	isEven: boolean;
	t: (key: string) => string;
}

const CampaignsTableRow: React.FC<CampaignsTableRowProps> = ({
	campaign,
	onEditCampaign,
	onDeleteClick,
	isEven,
	t,
}) => {
	const rowBgClass = isEven
		? "bg-white dark:bg-slate-900"
		: "bg-slate-50/30 dark:bg-slate-800/30";

	return (
		<TableRow
			className={`transition-all duration-200 border-b border-slate-100 dark:border-slate-700 ${rowBgClass} hover:bg-brand-light/5 dark:hover:bg-brand/10 hover:shadow-sm`}
		>
			<TableCell className="py-4">
				<span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${campaign.active
						? "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700"
						: "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700"
					}`}>
					{campaign.active ? t("common.active") : t("common.inactive")}
				</span>
			</TableCell>
			<TableCell className="py-4 text-slate-600 dark:text-slate-300">{campaign.client_name}</TableCell>
			<TableCell className="py-4 font-semibold text-slate-900 dark:text-slate-100">{campaign.name}</TableCell>
			<TableCell className="text-right py-4">
				<div className="flex justify-end space-x-1">
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30 transition-colors"
						onClick={(e) => { e.stopPropagation(); onEditCampaign(campaign.id); }}
					>
						<Edit className="h-4 w-4" />
						<span className="sr-only">{t("common.edit")}</span>
					</Button>
					<Button
						onClick={(e) => {
							e.stopPropagation();
							onDeleteClick(campaign);
						}}
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors"
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
