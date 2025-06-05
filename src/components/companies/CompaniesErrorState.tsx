
import React from "react";
import { AlertCircle } from "lucide-react";

interface CompaniesErrorStateProps {
  title: string;
  errorMessage: string;
  error: Error;
}

const CompaniesErrorState: React.FC<CompaniesErrorStateProps> = ({
  title,
  errorMessage,
  error,
}) => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
          {errorMessage}
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {error.message}
        </p>
      </div>
    </div>
  );
};

export default CompaniesErrorState;
