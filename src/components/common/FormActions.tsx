import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FormActionsProps {
  onCancel: () => void;
  isSaving?: boolean;
  saveText?: string;
  savingText?: string;
  cancelText?: string;
  backButton?: {
    text: string;
    onClick: () => void;
  };
  showCancelButton?: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  isSaving,
  saveText,
  savingText,
  cancelText,
  backButton,
  showCancelButton = true,
}) => {
  const { t } = useTranslation();

  return (
    <div className={`flex ${backButton ? 'justify-between' : 'justify-end'} items-center pt-6 mt-6 border-t border-slate-200 dark:border-slate-700`}>
      {backButton && (
        <Button variant="outline" onClick={backButton.onClick} disabled={isSaving}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {backButton.text}
        </Button>
      )}
      <div className="flex space-x-4">
        {showCancelButton && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            {cancelText || t('common.cancel')}
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSaving}
        >
          {isSaving ? (savingText || t('common.saving')) : (saveText || t('common.save'))}
        </Button>
      </div>
    </div>
  );
};

export default FormActions; 