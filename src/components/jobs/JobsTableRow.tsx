
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { File, FileSymlink, Trash2 } from "lucide-react";
import { Job } from "@/types/job";
import { formatCurrency } from "@/hooks/useJobsData";
import { Badge } from "@/components/ui/badge";
import JobStatusBadge from "./JobStatusBadge";
import { Link } from "react-router-dom";

interface JobsTableRowProps {
	job: Job;
	onEditJob: (id: string) => void;
	onDeleteClick: (e: React.MouseEvent, job: Job) => void;
	t: (key: string) => string;
}

const JobsTableRow: React.FC<JobsTableRowProps> = ({
	job,
	onEditJob,
	onDeleteClick,
	t,
}) => {
	const formatMonths = (months: string[]) => {
		return months.map(month => t(`common.${month}`)).join(", ");
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString();
	};

	const formatMonth = (month: number | null) => {
		if (!month) return "-";
		return month.toString().padStart(2, "0");
	};

	const renderMultipleCampaigns = (campaignNames: string[] = []) => {
		if (campaignNames.length === 0) {
			return job.campaign_name || "Unknown Campaign";
		}

		if (campaignNames.length === 1) {
			return campaignNames[0];
		}

		return (
			<div className="space-y-1">
				{campaignNames.slice(0, 2).map((name, index) => (
					<Badge key={index} variant="outline" className="text-xs">
						{name}
					</Badge>
				))}
				{campaignNames.length > 2 && (
					<Badge variant="secondary" className="text-xs">
						+{campaignNames.length - 2} more
					</Badge>
				)}
			</div>
		);
	};

	const renderMultipleClients = (clientNames: string[] = []) => {
		if (clientNames.length === 0) {
			return job.client_name || "Unknown Client";
		}

		if (clientNames.length === 1) {
			return clientNames[0];
		}

		return (
			<div className="space-y-1">
				{clientNames.slice(0, 2).map((name, index) => (
					<Badge key={index} variant="outline" className="text-xs">
						{name}
					</Badge>
				))}
				{clientNames.length > 2 && (
					<Badge variant="secondary" className="text-xs">
						+{clientNames.length - 2} more
					</Badge>
				)}
			</div>
		);
	};

	return (
		<TableRow className="cursor-pointer" onClick={() => onEditJob(job.id)}>
			<TableCell>
				<JobStatusBadge status={job.status} t={t} />
			</TableCell>
			<TableCell>{job.job_type_name}</TableCell>
			<TableCell>{renderMultipleClients(job.client_names)}</TableCell>
			<TableCell>{renderMultipleCampaigns(job.campaign_names)}</TableCell>
			<TableCell>{job.manager_name}</TableCell>
			<TableCell>{job.provider_name}</TableCell>
			<TableCell>{job.year || "-"}</TableCell>
			<TableCell>{formatMonth(job.month)}</TableCell>
			<TableCell>{formatCurrency(job.value, job.currency)}</TableCell>
			<TableCell>{job.invoice_reference}</TableCell>
			<TableCell className="text-right">
				<div className="flex justify-end space-x-2">
					{job.documents && job.documents.length > 0 && (
						<Button variant="ghost" className="h-9 px-3 text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-400" onClick={(e) => e.stopPropagation()} >
							<a href={job.documents[0]} target="_blank">
								<FileSymlink className="h-4 w-4" />
							</a>
						</Button>
					)}
					<Button
						variant="ghost"
						className="h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950/20"
						onClick={(e) => onDeleteClick(e, job)}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			</TableCell>
		</TableRow>
	);
};

export default JobsTableRow;
