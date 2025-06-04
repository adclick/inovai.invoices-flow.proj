
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Job, formatJobStatus } from "@/types/job";
import { formatCurrency } from "@/hooks/useJobsData";
import { Badge } from "@/components/ui/badge";
import JobStatusBadge from "./JobStatusBadge";

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
    <TableRow>
      <TableCell>
        <JobStatusBadge status={job.status} t={t} />
      </TableCell>
      <TableCell>{job.job_type_name}</TableCell>
      <TableCell>{renderMultipleClients(job.client_names)}</TableCell>
      <TableCell>{renderMultipleCampaigns(job.campaign_names)}</TableCell>
      <TableCell>{job.manager_name}</TableCell>
      <TableCell>{job.provider_name}</TableCell>
      <TableCell>{formatMonths(job.months)}</TableCell>
      <TableCell>{formatCurrency(job.value, job.currency)}</TableCell>
      <TableCell>{formatDate(job.created_at)}</TableCell>
      <TableCell>{job.provider_email_sent ? formatDate(job.provider_email_sent) : "-"}</TableCell>
      <TableCell>-</TableCell>
      <TableCell>{job.invoice_reference || "-"}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditJob(job.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
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
