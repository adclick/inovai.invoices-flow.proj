
import React from "react";
import { Badge } from "@/components/ui/badge";
import { STATUS_BADGE_CONFIG } from "@/utils/jobsListConstants";

interface JobStatusBadgeProps {
  status: string;
  t: (key: string) => string;
}

const JobStatusBadge: React.FC<JobStatusBadgeProps> = ({ status, t }) => {
  const config = STATUS_BADGE_CONFIG[status as keyof typeof STATUS_BADGE_CONFIG];
  
  if (!config) {
    return <Badge variant="outline">{status}</Badge>;
  }

  return (
    <Badge variant={config.variant} className={config.className}>
      {t(`jobs.${status}`)}
    </Badge>
  );
};

export default JobStatusBadge;
