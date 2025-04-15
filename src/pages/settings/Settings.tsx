
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Settings as SettingsIcon, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useSettings } from "@/hooks/useSettings";
import { type SettingUpdate } from "@/types/settings";

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const { settings, isLoading, isUpdating, updateSettings } = useSettings();
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (settings) {
      const initialValues: Record<string, string> = {};
      settings.forEach((setting) => {
        initialValues[setting.name] = setting.value;
      });
      setFormValues(initialValues);
      setHasChanges(false);
    }
  }, [settings]);

  const handleInputChange = (name: string, value: string) => {
    setFormValues((prev) => {
      const newValues = { ...prev, [name]: value };
      // Check if values have changed from original settings
      const hasChanged = settings?.some(
        (setting) => newValues[setting.name] !== setting.value
      );
      setHasChanges(hasChanged);
      return newValues;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasChanges) return;

    const updates: SettingUpdate[] = Object.entries(formValues)
      .filter(([name, value]) => {
        const originalSetting = settings?.find((s) => s.name === name);
        return originalSetting && originalSetting.value !== value;
      })
      .map(([name, value]) => ({ name, value }));

    if (updates.length > 0) {
      updateSettings(updates);
    }
  };

  // Determine the proper input type based on setting name and value
  const getInputComponent = (name: string, value: string, description?: string | null) => {
    if (name.startsWith("enable_") && (value === "true" || value === "false")) {
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={name}
            checked={formValues[name] === "true"}
            onCheckedChange={(checked) => {
              handleInputChange(name, checked ? "true" : "false");
            }}
          />
          <Label htmlFor={name} className="cursor-pointer">
            {description || name.replace(/_/g, " ")}
          </Label>
        </div>
      );
    }

    if (value.length > 100 || value.includes("\n")) {
      return (
        <div className="space-y-2">
          <Label htmlFor={name}>{description || name.replace(/_/g, " ")}</Label>
          <Textarea
            id={name}
            value={formValues[name] || ""}
            onChange={(e) => handleInputChange(name, e.target.value)}
            className="min-h-[100px]"
          />
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Label htmlFor={name}>{description || name.replace(/_/g, " ")}</Label>
        <Input
          id={name}
          value={formValues[name] || ""}
          onChange={(e) => handleInputChange(name, e.target.value)}
        />
      </div>
    );
  };

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    navigate("/");
    return null;
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <SettingsIcon className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-white">
              {t("settings.title")}
            </h1>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!hasChanges || isUpdating}
            className="w-full md:w-auto"
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("settings.saving")}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t("settings.saveChanges")}
              </>
            )}
          </Button>
        </div>

        <Separator className="my-4" />

          <div className="bg-white dark:bg-slate-800/50 p-4 md:p-6 rounded-lg border border-slate-200/50 dark:border-slate-700 shadow-sm">
            <h2 className="text-lg font-medium mb-4 text-slate-800 dark:text-white">
              {t("settings.general")}
            </h2>
            <div className="space-y-4">
              {settings
                .map((setting) => (
                  <div key={setting.id}>
                    {getInputComponent(setting.name, setting.value, setting.description)}
                  </div>
                ))}
            </div>
          </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
