
import { JobFormValues } from "./types";

export const getJobFormDefaults = (): JobFormValues => ({
  line_items: [],
  company_id: "",
  provider_id: "",
  manager_id: "",
  status: "draft",
  due_date: "",
  payment_date: "",
  provider_message: "",
  public_notes: "",
  private_notes: "",
  invoice_reference: "",
  documents: [],
});
