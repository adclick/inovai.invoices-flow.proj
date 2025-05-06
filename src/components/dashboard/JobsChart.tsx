
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";
import { ChartTooltipContent } from "@/components/ui/chart";

interface JobsChartProps {
  chartData: Array<{name: string, value: number}>;
  isLoading: boolean;
}

const JobsChart: React.FC<JobsChartProps> = ({ chartData, isLoading }) => {
  const { t } = useTranslation();
  
  return (
    <Card className="lg:col-span-8">
      <CardHeader>
        <CardTitle>{t('dashboard.jobsOverview')}</CardTitle>
        <CardDescription>{t('dashboard.currentStatusDistribution')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="w-full aspect-[3/2]">
            <Skeleton className="w-full h-full" />
          </div>
        ) : (
          <div className="h-80">
            <ChartContainer config={{}} className="w-full h-full">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobsChart;
