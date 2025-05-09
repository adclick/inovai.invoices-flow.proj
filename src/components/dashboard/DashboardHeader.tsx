
import React, { ReactNode } from "react";
import { format } from "date-fns";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  title: string;
  actionButton?: ReactNode;
  showCreateButton?: boolean;
  createButtonPath?: string;
  createButtonText?: string;
  createButtonAction?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  title,
  actionButton,
  showCreateButton = false,
  createButtonPath,
  createButtonText,
  createButtonAction
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const handleCreateClick = () => {
    if (createButtonAction) {
      createButtonAction();
    } else if (createButtonPath) {
      navigate(createButtonPath);
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
      </div>
      <div className="flex items-center space-x-2">
        {actionButton}
        
        {showCreateButton && (
          <Button onClick={handleCreateClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {createButtonText || t('jobs.createNew')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
