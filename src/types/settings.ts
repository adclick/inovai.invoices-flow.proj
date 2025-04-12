
export type Setting = {
  id: string;
  name: string;
  value: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type SettingUpdate = {
  name: string;
  value: string;
};
