import React from "react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface LineItemStatusBadgeProps {
  status: "in_progress" | "waiting_invoice" | "waiting_payment" | "closed";
  className?: string;
}

export const LineItemStatusBadge: React.FC<LineItemStatusBadgeProps> = ({ status, className }) => {
  const { t } = useTranslation();

  const statusConfig = {
    in_progress: {
      label: t("jobs.lineItemStatus.inProgress"),
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    },
    waiting_invoice: {
      label: t("jobs.lineItemStatus.waitingInvoice"),
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    },
    waiting_payment: {
      label: t("jobs.lineItemStatus.waitingPayment"),
      className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    },
    closed: {
      label: t("jobs.lineItemStatus.closed"),
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    },
  };

  const config = statusConfig[status];

  return (
    <Badge 
      variant="outline" 
      className={`${config.className} ${className || ""}`}
    >
      {config.label}
    </Badge>
  );
};