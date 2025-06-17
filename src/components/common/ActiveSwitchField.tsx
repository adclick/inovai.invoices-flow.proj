
import React from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from 'react-i18next';

interface ActiveSwitchFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  description: string;
  disabled?: boolean;
}

const ActiveSwitchField = <TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled = false,
}: ActiveSwitchFieldProps<TFieldValues>) => {
  const { t } = useTranslation();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="space-y-1">
            <FormLabel className="text-base font-semibold text-slate-800 dark:text-slate-100">
              {label || t('common.active')}
            </FormLabel>
            <FormDescription className="text-sm text-slate-600 dark:text-slate-300 font-medium">
              {description}
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
              aria-label={label || t('common.active')}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-brand data-[state=checked]:to-brand-light"
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default ActiveSwitchField;
