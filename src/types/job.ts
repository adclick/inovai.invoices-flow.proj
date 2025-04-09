
export type Job = {
  id: string;
  client_id: string;
  campaign_id: string;
  provider_id: string;
  manager_id: string;
  value: number;
  currency: "euro" | "usd" | "gbp";
  status: "New" | "Manager OK" | "Pending Invoice" | "Pending Payment" | "Paid";
  paid: boolean;
  manager_ok: boolean;
  months: string[];
  due_date?: string | null;
  public_notes?: string | null;
  private_notes?: string | null;
  documents?: string[] | null;
  public_token?: string | null;
  created_at: string;
  client_name?: string;
  campaign_name?: string;
  provider_name?: string;
  manager_name?: string;
};
