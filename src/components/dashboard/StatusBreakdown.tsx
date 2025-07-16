
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface StatusBreakdownProps {
  stats: {
    active: number;
    closed: number;
    working: number;
  } | undefined;
}

const StatusBreakdown: React.FC<StatusBreakdownProps> = ({ stats }) => {
  const { t } = useTranslation();
  
  return (
    <Card className="lg:col-span-4">
      <CardHeader>
        <CardTitle>{t('dashboard.statusBreakdown')}</CardTitle>
        <CardDescription>{t('dashboard.jobsByStatus')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm font-medium">{t('dashboard.active')}</span>
            </div>
            <span className="font-medium">{stats?.active || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
              <span className="text-sm font-medium">{t('dashboard.closed')}</span>
            </div>
            <span className="font-medium">{stats?.closed || 0}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusBreakdown;
