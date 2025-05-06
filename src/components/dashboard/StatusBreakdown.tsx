
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface StatusBreakdownProps {
  stats: {
    new: number;
    active: number;
    pendingInvoice: number;
    pendingValidation: number;
    pendingPayment: number;
    paid: number;
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
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-sm font-medium">{t('dashboard.draft')}</span>
            </div>
            <span className="font-medium">{stats?.new || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm font-medium">{t('dashboard.active')}</span>
            </div>
            <span className="font-medium">{stats?.active || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <span className="text-sm font-medium">{t('dashboard.pendingInvoice')}</span>
            </div>
            <span className="font-medium">{stats?.pendingInvoice || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
              <span className="text-sm font-medium">{t('dashboard.pendingValidation')}</span>
            </div>
            <span className="font-medium">{stats?.pendingValidation || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
              <span className="text-sm font-medium">{t('dashboard.pendingPayment')}</span>
            </div>
            <span className="font-medium">{stats?.pendingPayment || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
              <span className="text-sm font-medium">{t('dashboard.paid')}</span>
            </div>
            <span className="font-medium">{stats?.paid || 0}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusBreakdown;
