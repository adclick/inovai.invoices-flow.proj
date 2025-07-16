import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Save, Loader2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentLanguage, changeLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(currentLanguage);
  const [fullName, setFullName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id as any)
            .single();

          if (error) throw error;
          if (data) {
            setFullName((data as any).full_name);
          }
        } catch (error) {
          console.error(t("profile.errorFetchingProfile"), error);
        }
      }
    };

    fetchUserProfile();
  }, [user, t]);

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLanguage === currentLanguage) return;

    setIsLoading(true);
    try {
      await changeLanguage(selectedLanguage);
      toast({
        title: t("profile.updateSuccess"),
        description: t("profile.languageUpdated"),
      });
    } catch (error) {
      console.error(t("profile.errorUpdatingLanguage"), error);
      toast({
        title: t("profile.updateError"),
        description: t("profile.languageUpdateError"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <User className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-white">
            {t("profile.title")}
          </h1>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("profile.accountInfo")}</CardTitle>
              <CardDescription>
                {t("profile.email")}: {user?.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>{t("profile.fullName")}</Label>
                  <p className="mt-1 font-medium">{fullName || user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("profile.preferences")}</CardTitle>
              <CardDescription>{t("profile.languagePreference")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <RadioGroup
                  value={selectedLanguage}
                  onValueChange={handleLanguageChange}
                  className="flex flex-col space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="en" id="en" />
                    <Label htmlFor="en">{t("profile.english")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pt" id="pt" />
                    <Label htmlFor="pt">{t("profile.portuguese")}</Label>
                  </div>
                </RadioGroup>

                <Button
                  type="submit"
                  disabled={selectedLanguage === currentLanguage || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("common.loading")}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t("profile.saveChanges")}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
