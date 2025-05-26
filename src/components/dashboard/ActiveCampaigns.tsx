import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface Campaign {
  id: string;
  name: string;
  client: {
    name: string;
  };
  jobs: Array<{
    id: string;
    status: string;
  }>;
}

interface ActiveCampaignsProps {
  campaigns: Campaign[] | undefined;
  isLoading: boolean;
}

const ActiveCampaigns: React.FC<ActiveCampaignsProps> = ({ campaigns, isLoading }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  return (
    <Card className="lg:col-span-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>{t('dashboard.activeCampaigns')}</CardTitle>
					<a href="/campaigns" className="text-sm">
						<Button variant="ghost" size="sm" className="text-sm">
							{t('common.viewAll')}
						</Button>
					</a>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns?.map((campaign) => {
              const jobStatuses = campaign.jobs.map(job => job.status);
              const hasPendingJobs = jobStatuses.some(status => 
                ["pending_invoice", "pending_validation", "pending_payment"].includes(status)
              );
              const hasActiveJobs = jobStatuses.some(status => 
                ["draft", "active"].includes(status)
              );

              return (
                <button
                  key={campaign.id}
                  className="w-full text-left p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {campaign.name}
                    </h3>
                    <Badge variant={hasPendingJobs ? "secondary" : hasActiveJobs ? "default" : "outline"}>
                      {hasPendingJobs ? t('dashboard.pending') : hasActiveJobs ? t('dashboard.active') : t('dashboard.completed')}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {campaign.client?.name}
                  </p>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {campaign.jobs.length} {t('dashboard.jobs')}
                    </span>
                    <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ 
                          width: `${(campaign.jobs.filter(job => job.status === 'paid').length / campaign.jobs.length) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveCampaigns;
