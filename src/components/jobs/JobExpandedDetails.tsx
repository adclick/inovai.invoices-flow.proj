
import React from "react";
import { Job } from "@/types/job";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/hooks/useJobsData";

interface JobExpandedDetailsProps {
  job: Job;
  t: (key: string) => string;
}

const JobExpandedDetails: React.FC<JobExpandedDetailsProps> = ({ job, t }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {/* Dates Section */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300">{t("jobs.dates")}</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">{t("jobs.dueDate")}:</span>
              <span>{formatDate(job.due_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">{t("jobs.paymentDate")}:</span>
              <span>{formatDate(job.payment_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">{t("jobs.providerEmailSent")}:</span>
              <span>{formatDate(job.provider_email_sent)}</span>
            </div>
          </div>
        </div>

        {/* Financial Section */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300">{t("jobs.financial")}</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">{t("jobs.totalValue")}:</span>
              <span className="font-medium">{formatCurrency(job.value, job.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">{t("jobs.currency")}:</span>
              <span>{job.currency.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">{t("jobs.reference")}:</span>
              <span>{job.invoice_reference || "-"}</span>
            </div>
          </div>
        </div>

        {/* Company Section */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300">{t("jobs.company")}</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">{t("companies.title")}:</span>
              <span>{job.company_name || "-"}</span>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Line Items Section */}
      {job.line_items && job.line_items.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300">{t("jobs.lineItems")}</h4>
          <div className="grid gap-2">
            {job.line_items.map((item, index) => (
              <div key={index} className="flex flex-wrap items-center gap-2 p-3 bg-white dark:bg-slate-700 rounded-md border">
                <Badge variant="outline" className="text-xs">
                  {item.year}/{item.month.toString().padStart(2, "0")}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {item.campaign_name}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {item.client_name}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {item.job_type_name}
                </Badge>
                <div className="ml-auto font-medium text-sm">
                  {formatCurrency(item.value, job.currency)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes Section */}
      {(job.public_notes || job.private_notes) && (
        <>
          <Separator className="my-4" />
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300">{t("jobs.notes")}</h4>
            {job.public_notes && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{t("jobs.publicNotes")}:</span>
                <p className="text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 p-2 rounded border">
                  {job.public_notes}
                </p>
              </div>
            )}
            {job.private_notes && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{t("jobs.privateNotes")}:</span>
                <p className="text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 p-2 rounded border">
                  {job.private_notes}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default JobExpandedDetails;
