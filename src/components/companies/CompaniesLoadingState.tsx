
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface CompaniesLoadingStateProps {
  title: string;
  loadingText: string;
}

const CompaniesLoadingState: React.FC<CompaniesLoadingStateProps> = ({
  title,
  loadingText,
}) => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{title}</h1>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-48" />
        </div>

        <div className="rounded-md border">
          <div className="p-4">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-4 text-slate-500">
        {loadingText}
      </div>
    </div>
  );
};

export default CompaniesLoadingState;
