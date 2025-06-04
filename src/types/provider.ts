
export type Provider = {
  id: string;
  name: string;
  email: string;
  language: string;
  country: string | null;
  iban: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};
