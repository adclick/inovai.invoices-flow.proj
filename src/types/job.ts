
export type Job = {
  id: string;
  campaign_id: string; // Keep for backward compatibility
  provider_id: string;
  manager_id: string;
  company_id?: string | null; // New company field
  value: number;
  currency: "euro" | "usd" | "gbp";
  status: "draft" | "active" | "pending_invoice" | "pending_validation" | "pending_payment" | "paid";
  months: string[];
  year?: number | null; // New year field
  month?: number | null; // New month field (1-12)
  due_date?: string | null;
  public_notes?: string | null;
  private_notes?: string | null;
  documents?: string[] | null;
  created_at: string;
  campaign_name?: string;
  provider_name?: string;
  manager_name?: string;
  client_name?: string; // We keep this for display purposes, derived from the campaign
  client_id?: string; // Adding this to support the current implementation in JobsGroupedList
  company_name?: string; // New company name field
  provider_email_sent?: string | null;
  job_type_id?: string | null;
  job_type_name?: string | null;
  invoice_reference?: string | null;
  // New fields for many-to-many relationship
  campaign_ids?: string[];
  campaign_names?: string[];
  client_ids?: string[];
  client_names?: string[];
	payment_date?: string | null;
};

// Helper function to format status labels for display
export const formatJobStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'draft': 'Draft',
    'active': 'Active',
    'pending_invoice': 'Pending Invoice',
    'pending_validation': 'Pending Validation',
    'pending_payment': 'Pending Payment',
    'paid': 'Paid'
  };
  
  return statusMap[status] || status;
};
