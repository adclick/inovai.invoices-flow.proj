
import { Database } from "@/integrations/supabase/types";

// Status options for jobs
export const JOB_STATUS_OPTIONS = [
  { value: "draft", label: "jobs.draft" },
  { value: "active", label: "jobs.active" },
  { value: "pending_invoice", label: "jobs.pendingInvoice" },
  { value: "pending_validation", label: "jobs.pendingValidation" },
  { value: "pending_payment", label: "jobs.pendingPayment" },
  { value: "paid", label: "jobs.paid" },
];

// Month options
export const MONTH_OPTIONS = [
  { value: "january", label: "common.january" },
  { value: "february", label: "common.february" },
  { value: "march", label: "common.march" },
  { value: "april", label: "common.april" },
  { value: "may", label: "common.may" },
  { value: "june", label: "common.june" },
  { value: "july", label: "common.july" },
  { value: "august", label: "common.august" },
  { value: "september", label: "common.september" },
  { value: "october", label: "common.october" },
  { value: "november", label: "common.november" },
  { value: "december", label: "common.december" },
];

// Language options for providers
export const LANGUAGE_OPTIONS = [
  { value: "pt", label: "common.portuguese" },
  { value: "en", label: "common.english" },
  { value: "es", label: "common.spanish" },
];

// Currency options
export const CURRENCY_OPTIONS = [
  { value: "euro", label: "common.euro" },
  { value: "usd", label: "common.usd" },
  { value: "gbp", label: "common.gbp" },
];

// Form field types for reusability
export type SelectOption = {
  value: string;
  label: string;
};

export type EntitySelectOption = {
  id: string;
  name: string;
};
