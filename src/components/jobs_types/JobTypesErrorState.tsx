
import React from "react";

interface JobTypesErrorStateProps {
  title: string;
  errorMessage: string;
  error: Error;
}

const JobTypesErrorState: React.FC<JobTypesErrorStateProps> = ({ title, errorMessage, error }) => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h1>
      </div>
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <p className="text-red-600 dark:text-red-400">{errorMessage}: {error.message}</p>
      </div>
    </div>
  );
};

export default JobTypesErrorState;
