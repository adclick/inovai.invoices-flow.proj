import React from "react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface JobStatusBadgeProps {
  status: "active" | "closed";
  className?: string;
}

export const JobStatusBadge: React.FC<JobStatusBadgeProps> = ({ status, className }) => {
  const { t } = useTranslation();

  const statusConfig = {
    active: {
      label: t("jobs.status.active"),
      variant: "default" as const,
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    },
    closed: {
      label: t("jobs.status.closed"),
      variant: "secondary" as const,
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    },
  };

  const config = statusConfig[status];

  return (
    <Badge 
      variant={config.variant} 
      className={`${config.className} ${className || ""}`}
    >
      {config.label}
    </Badge>
  );
};