import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface EditPageLayoutProps {
  title: string;
  description: string;
  backPath?: string;
  backButtonText?: string;
  isLoading?: boolean;
  loadingText?: string;
  isError?: boolean;
  errorText?: string;
  children: React.ReactNode;
  contentClassName?: string;
}

const EditPageLayout: React.FC<EditPageLayoutProps> = ({
  title,
  description,
  backPath,
  backButtonText,
  isLoading,
  loadingText,
  isError,
  errorText,
  children,
  contentClassName = "bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700",
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const effectiveLoadingText = loadingText || t('common.loading');
  const effectiveErrorText = errorText || t('common.error');
  const effectiveBackButtonText = backButtonText || t('common.back');

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-4xl mx-auto">
          {backPath && (
            <div className="mb-6">
              <Button variant="ghost" onClick={() => navigate(backPath)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {effectiveBackButtonText}
              </Button>
            </div>
          )}
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-1">{title}</h1>
          {description && <p className="text-slate-500 dark:text-slate-400 mt-1 mb-6">{description}</p>}
          <div className="flex justify-center items-center h-64">
            <p className="text-slate-500 dark:text-slate-400">{effectiveLoadingText}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-4xl mx-auto">
          {backPath && (
            <div className="mb-6">
              <Button variant="ghost" onClick={() => navigate(backPath)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {effectiveBackButtonText}
              </Button>
            </div>
          )}
           <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-1">{title}</h1>
           {description && <p className="text-slate-500 dark:text-slate-400 mt-1 mb-6">{description}</p>}
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{effectiveErrorText}</p>
            {backPath && (
               <Button className="mt-4" onClick={() => navigate(backPath)}>
                 {effectiveBackButtonText}
               </Button>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h1>
          {description && <p className="text-slate-500 dark:text-slate-400 mt-1">{description}</p>}
        </div>
        <div className={contentClassName}>
          {children}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditPageLayout; 