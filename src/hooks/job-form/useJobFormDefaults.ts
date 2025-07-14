
import { JobFormValues } from "./types";

export const getJobFormDefaults = (): JobFormValues => ({
  company_id: "",
  unique_invoice: false,
  documents: [],
  line_items: [{
    year: new Date().getFullYear(),
    month: "",
    client_id: "",
    campaign_id: "",
    job_type_id: "",
    value: undefined,
    manager_id: "",
    provider_id: "",
    payment_date: "",
    status: "in_progress",
    documents: [],
    private_notes: "",
    public_notes: "",
  }],
});
