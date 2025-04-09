
export type Job = {
  id: string;
  client_id: string;
  campaign_id: string;
  provider_id: string;
  manager_id: string;
  value: number;
  currency: "euro" | "usd" | "gbp";
  status: "new" | "manager_ok" | "pending_invoice" | "pending_payment" | "paid";
  paid: boolean;
  manager_ok: boolean;
  months: string[];
  due_date?: string | null;
  public_notes?: string | null;
  private_notes?: string | null;
  documents?: string[] | null;
  public_token?: string | null;
};
