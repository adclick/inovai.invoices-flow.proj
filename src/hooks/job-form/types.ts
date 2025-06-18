
import { z } from "zod";

// Line item schema
export const lineItemSchema = z.object({
  year: z.coerce.number().min(1900, "jobs.yearRequired").max(2100, "jobs.yearMax"),
  month: z.string().min(1, "jobs.monthRequired"),
  client_id: z.string().min(1, "jobs.selectClient"),
  campaign_id: z.string().min(1, "jobs.selectCampaign"),
  job_type_id: z.string().min(1, "jobs.selectJobType"),
  value: z.coerce.number().min(0, "jobs.valueRequired"),
});

// Main job form schema with conditional validation
export const jobSchema = z.object({
  line_items: z.array(lineItemSchema).optional(),
  company_id: z.string().optional(),
  provider_id: z.string().optional(),
  manager_id: z.string().optional(),
  status: z.enum(["draft", "active", "pending_invoice", "pending_validation", "pending_payment", "paid"] as const),
  due_date: z.string().optional(),
  payment_date: z.string().optional(),
  provider_message: z.string().optional(),
  public_notes: z.string().optional(),
  private_notes: z.string().optional(),
  invoice_reference: z.string().optional(),
  documents: z.array(z.string()).optional(),
}).refine((data) => {
  // If no line items, status must be draft
  if (!data.line_items || data.line_items.length === 0) {
    return data.status === "draft";
  }
  return true;
}, {
  message: "jobs.draftOnlyWithoutLineItems",
  path: ["status"],
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
