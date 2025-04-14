
export type Job = {
  id: string;
  client_id: string;
  campaign_id: string;
  provider_id: string;
  manager_id: string;
  value: number;
  currency: "euro" | "usd" | "gbp";
  status: "draft" | "active" | "pending_invoice" | "pending_validation" | "pending_payment" | "paid";
  paid: boolean;
  manager_ok: boolean;
  months: string[];
  due_date?: string | null;
  public_notes?: string | null;
  private_notes?: string | null;
  documents?: string[] | null;
  public_token?: string | null;
  payment_token?: string | null;
  created_at: string;
  client_name?: string;
  campaign_name?: string;
  provider_name?: string;
  manager_name?: string;
};

// Helper function to format status labels for display
export const formatJobStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'draft': 'Active',
    'active': 'Active',
    'pending_invoice': 'Pending Invoice',
    'pending_validation': 'Pending Validation',
    'pending_payment': 'Pending Payment',
    'paid': 'Paid'
  };
  
  return statusMap[status] || status;
};
