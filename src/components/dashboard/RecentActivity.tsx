import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { formatJobStatus } from "@/types/job";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export interface ActivityItem {
  id: string;
  status: string;
  created_at: string;
  campaign: {
    name: string;
  };
  client: {
    name: string;
  };
  provider: {
    name: string;
  };
  manager: {
    name: string;
  };
}

interface RecentActivityProps {
  recentActivity: ActivityItem[] | undefined;
  isLoading: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ recentActivity, isLoading }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  return (
    <Card className="lg:col-span-8">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>{t('dashboard.recentActivity')}</CardTitle>
          <Button variant="ghost" size="sm" className="text-sm" onClick={() => navigate('/jobs')}>
            {t('common.viewAll')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivity?.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <Badge
                    variant={
                      activity.status === "paid" ? "default" : 
                      activity.status.startsWith("pending") ? "secondary" : 
                      "outline"
                    }
                  >
                    {formatJobStatus(activity.status)}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {activity.campaign?.name} - {activity.client?.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {activity.provider?.name} • {format(new Date(activity.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600 dark:text-slate-400">{activity.manager?.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
