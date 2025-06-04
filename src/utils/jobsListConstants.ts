
export const ITEMS_PER_PAGE = 10;

export const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "jobs.allStatuses" },
  { value: "draft", label: "jobs.draft" },
  { value: "active", label: "jobs.active" },
  { value: "pending_invoice", label: "jobs.pendingInvoice" },
  { value: "pending_validation", label: "jobs.pendingValidation" },
  { value: "pending_payment", label: "jobs.pendingPayment" },
  { value: "paid", label: "jobs.paid" },
];

export const STATUS_BADGE_CONFIG = {
  draft: { variant: "outline" as const, className: "text-slate-500" },
  active: { variant: "default" as const, className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" },
  pending_invoice: { variant: "default" as const, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" },
  pending_validation: { variant: "default" as const, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" },
  pending_payment: { variant: "default" as const, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" },
  paid: { variant: "default" as const, className: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300" },
};
