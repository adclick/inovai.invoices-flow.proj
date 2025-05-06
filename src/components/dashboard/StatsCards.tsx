import React from "react";
import { TrendingUp, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface StatsCardsProps {
  activeJobs: number;
  pendingActionJobs: number;
  completedJobs: number;
  isLoading: boolean;
}

const StatsCards: React.FC<StatsCardsProps> = ({ 
  activeJobs, 
  pendingActionJobs, 
  completedJobs, 
  isLoading 
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('dashboard.activeJobs')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-bold">
              {isLoading ? <Skeleton className="h-9 w-16" /> : activeJobs}
            </div>
            <div className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs px-2 py-0.5 rounded-full font-medium flex items-center">
              Active
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('dashboard.pendingActions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-bold">
              {isLoading ? <Skeleton className="h-9 w-16" /> : pendingActionJobs}
            </div>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
              {t('dashboard.needsAttention')}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('dashboard.completedJobs')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-bold">
              {isLoading ? <Skeleton className="h-9 w-16" /> : completedJobs}
            </div>
            <div className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs px-2 py-0.5 rounded-full font-medium flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              {t('dashboard.paid')}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
