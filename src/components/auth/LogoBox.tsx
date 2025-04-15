
import React from "react";
import { FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

const LogoBox: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="text-center animate-fade-in w-full max-w-lg">
      <div className="inline-block p-3 rounded-full bg-white/10 mb-4 sm:mb-6">
        <FileText size={32} className="text-white sm:h-10 sm:w-10" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">InvoicesFlow</h1>
      <p className="text-white/80 text-sm sm:text-base max-w-md mx-auto">
        {t("logoBox.subtitle")}
      </p>
      
      <div className="mt-6 sm:mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto">
        <div className="bg-white/10 p-3 sm:p-4 rounded-lg">
          <div className="font-bold text-white text-sm sm:text-base">{t("logoBox.providersTitle")}</div>
          <div className="text-xs sm:text-sm text-white/70">{t("logoBox.providersDesc")}</div>
        </div>
        <div className="bg-white/10 p-3 sm:p-4 rounded-lg">
          <div className="font-bold text-white text-sm sm:text-base">{t("logoBox.invoicesTitle")}</div>
          <div className="text-xs sm:text-sm text-white/70">{t("logoBox.invoicesDesc")}</div>
        </div>
        <div className="bg-white/10 p-3 sm:p-4 rounded-lg">
          <div className="font-bold text-white text-sm sm:text-base">{t("logoBox.workflowTitle")}</div>
          <div className="text-xs sm:text-sm text-white/70">{t("logoBox.workflowDesc")}</div>
        </div>
      </div>
      
      <div className="mt-6 sm:mt-10 text-white/50 text-xs sm:text-sm">
        {t("logoBox.copyright")}
      </div>
    </div>
  );
};

export default LogoBox;
