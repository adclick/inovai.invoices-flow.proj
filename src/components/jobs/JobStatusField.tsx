
import { useTranslation } from "react-i18next";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

interface JobStatusFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

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
        </div>
        
        <div className="flex items-center gap-4">
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
