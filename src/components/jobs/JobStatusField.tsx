
import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { formatJobStatus } from "@/types/job";

interface JobStatusFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'draft': 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100',
    'active': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    'pending_invoice': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
    'pending_validation': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
    'pending_payment': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
    'paid': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
  };
  
  return colorMap[status] || colorMap['draft'];
};

export const JobStatusField = ({
  value,
  onChange,
  disabled = false
}: JobStatusFieldProps) => {
  const { t } = useTranslation();
  
  const statusOptions = [
    { value: "draft", label: t("jobs.draft") },
    { value: "active", label: t("jobs.active") },
    { value: "pending_invoice", label: t("jobs.pendingInvoice") },
    { value: "pending_validation", label: t("jobs.pendingValidation") },
    { value: "pending_payment", label: t("jobs.pendingPayment") },
    { value: "paid", label: t("jobs.paid") },
  ];

  return (
    <Card className="bg-slate-50 dark:bg-slate-900 border-2">
      <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-semibold text-base">
            {t("jobs.status")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("jobs.currentStatus")}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge 
            className={`${getStatusColor(value)} px-3 py-1 text-sm font-medium`}
            variant="outline"
          >
            {formatJobStatus(value)}
          </Badge>
          
          <Select
            value={value}
            onValueChange={onChange}
            disabled={disabled}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("jobs.selectStatus")} />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
};
