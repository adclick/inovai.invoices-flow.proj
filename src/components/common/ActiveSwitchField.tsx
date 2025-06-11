
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
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">{label || t('common.active')}</FormLabel>
            <FormDescription>
              {description}
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
              aria-label={label || t('common.active')}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default ActiveSwitchField;
