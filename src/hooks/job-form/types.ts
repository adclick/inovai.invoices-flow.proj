import { z } from "zod";

// Line item schema with expanded fields
export const lineItemSchema = z.object({
  year: z.coerce.number().min(1900, "jobs.yearRequired").max(2100, "jobs.yearMax"),
  month: z.string().min(1, "jobs.monthRequired"),
  client_id: z.string().min(1, "jobs.selectClient"),
  campaign_id: z.string().min(1, "jobs.selectCampaign"),
  job_type_id: z.string().min(1, "jobs.selectJobType"),
  value: z.coerce.number().min(0).optional(),
  // New optional fields
  manager_id: z.string().optional(),
  provider_id: z.string().optional(),
  payment_date: z.string().optional(),
  status: z.enum(["in_progress", "waiting_invoice", "waiting_payment", "closed"] as const).default("in_progress"),
  documents: z.array(z.string()).optional(),
  private_notes: z.string().optional(),
  public_notes: z.string().optional(),
});

// Simplified job form schema - company required, at least 1 line item
export const jobSchema = z.object({
  name: z.string().min(1, "jobs.nameRequired"),
  company_id: z.string().min(1, "jobs.selectCompany"),
  manager_id: z.string().min(1, "jobs.selectManager"),
  unique_invoice: z.boolean().default(false),
  documents: z.array(z.string()).optional(),
  line_items: z.array(lineItemSchema).min(1, "jobs.atLeastOneLineItem"),
}).refine((data) => {
  // Must have at least one line item with company
  return data.line_items && data.line_items.length >= 1 && data.company_id;
}, {
  message: "jobs.requireCompanyAndLineItems",
  path: ["line_items"],
});

export type JobFormValues = z.infer<typeof jobSchema>;
export type LineItemFormValues = z.infer<typeof lineItemSchema>;

export interface UseJobFormLogicProps {
  id?: string;
  mode: 'create' | 'edit';
  onClose: () => void;
  onSuccess?: () => void;
  campaigns: any[];
}