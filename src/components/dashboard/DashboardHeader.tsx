
import React from "react";
import { format } from "date-fns";
import { Filter, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface DashboardHeaderProps {
  title: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title }) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" className="hidden md:flex">
          <Filter className="mr-1 h-4 w-4" />
          {t('common.filter')}
        </Button>
        <Button variant="outline" size="sm" className="hidden md:flex">
          <Search className="mr-1 h-4 w-4" />
          {t('common.search')}
        </Button>
        <Button size="sm">
          <Plus className="mr-1 h-4 w-4" />
          {t('jobs.newJob')}
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
