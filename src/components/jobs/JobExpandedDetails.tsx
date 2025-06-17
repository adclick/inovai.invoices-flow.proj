
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
    <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50/20 to-brand-light/10 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 border-t border-brand-light/20 dark:border-brand/20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Dates Section */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wide border-b border-brand-light/30 pb-2">
            {t("jobs.importantDates")}
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-slate-600 dark:text-slate-400 font-medium">{t("jobs.dueDate")}:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(job.due_date)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600 dark:text-slate-400 font-medium">{t("jobs.paymentDate")}:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(job.payment_date)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600 dark:text-slate-400 font-medium">{t("jobs.providerEmailSent")}:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(job.provider_email_sent)}</span>
            </div>
          </div>
        </div>

        {/* Financial Section */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wide border-b border-brand-light/30 pb-2">
            {t("jobs.financialInfo")}
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-slate-600 dark:text-slate-400 font-medium">{t("jobs.totalValue")}:</span>
              <span className="font-bold text-lg text-brand-dark dark:text-brand-light">{formatCurrency(job.value, job.currency)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600 dark:text-slate-400 font-medium">{t("jobs.reference")}:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{job.invoice_reference || "-"}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600 dark:text-slate-400 font-medium">{t("jobs.invoice")}:</span>
              <span>
                <a 
                  href={job.documents[0]} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-brand hover:text-brand-dark dark:text-brand-light dark:hover:text-brand underline font-medium transition-colors"
                >
                  {job.documents[0] ? "View Document" : "-"}
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-6 bg-gradient-to-r from-transparent via-brand-light/30 to-transparent" />

      {/* Line Items Section */}
      {job.line_items && job.line_items.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wide border-b border-brand-light/30 pb-2">
            {t("jobs.lineItems")}
          </h4>
          <div className="grid gap-3">
            {job.line_items.map((item, index) => (
              <div key={index} className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm hover:shadow-md transition-shadow">
                <Badge variant="outline" className="text-xs font-medium bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700">
                  {item.year}/{item.month.toString().padStart(2, "0")}
                </Badge>
                <Badge variant="outline" className="text-xs font-medium bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
                  {item.company_name}
                </Badge>
                <Badge variant="outline" className="text-xs font-medium bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700">
                  {item.client_name}
                </Badge>
                <Badge variant="secondary" className="text-xs font-medium bg-brand-light/20 text-brand-dark border-brand-light dark:bg-brand/20 dark:text-brand-light">
                  {item.campaign_name}
                </Badge>
                <Badge variant="outline" className="text-xs font-medium bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700">
                  {item.job_type_name}
                </Badge>
                <div className="ml-auto font-bold text-lg text-brand-dark dark:text-brand-light">
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
          <Separator className="my-6 bg-gradient-to-r from-transparent via-brand-light/30 to-transparent" />
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wide border-b border-brand-light/30 pb-2">
              {t("jobs.notes")}
            </h4>
            {job.public_notes && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{t("jobs.publicNotes")}:</span>
                <p className="text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm leading-relaxed">
                  {job.public_notes}
                </p>
              </div>
            )}
            {job.private_notes && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{t("jobs.privateNotes")}:</span>
                <p className="text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm leading-relaxed">
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
