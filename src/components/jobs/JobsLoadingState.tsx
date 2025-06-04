
import React from "react";

interface JobsLoadingStateProps {
  title: string;
  loadingText: string;
}

const JobsLoadingState: React.FC<JobsLoadingStateProps> = ({ title, loadingText }) => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h1>
      </div>
      <div className="flex justify-center items-center h-64">
        <p className="text-slate-500 dark:text-slate-400">{loadingText}</p>
      </div>
    </div>
  );
};

export default JobsLoadingState;
