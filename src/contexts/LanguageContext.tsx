
import React, { createContext, useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

type LanguageContextType = {
  currentLanguage: string;
  changeLanguage: (lang: string) => Promise<void>;
  isLoading: boolean;
};

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: "pt",
  changeLanguage: async () => {},
  isLoading: true,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>("en");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { i18n } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserLanguage = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("language")
            .eq("id", user.id as string)
            .maybeSingle();

          if (error) {
            console.error("Error fetching user language:", error);
          } else if (data && typeof data === 'object' && 'language' in data) {
            const profileData = data as any;
            if (profileData.language) {
              await i18n.changeLanguage(profileData.language);
              setCurrentLanguage(profileData.language);
            }
          }
        } catch (error) {
          console.error("Error fetching user language:", error);
        }
      }
      setIsLoading(false);
    };

    fetchUserLanguage();
  }, [user, i18n]);

  const changeLanguage = async (lang: string) => {
    if (lang === currentLanguage) return;

    try {
      setIsLoading(true);
      await i18n.changeLanguage(lang);
      setCurrentLanguage(lang);

      if (user) {
        const { error } = await supabase
          .from("profiles")
          .update({ language: lang } as any)
          .eq("id", user.id as string);

        if (error) {
          console.error("Error updating user language:", error);
        }
      }
    } catch (error) {
      console.error("Error changing language:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        changeLanguage,
        isLoading,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
