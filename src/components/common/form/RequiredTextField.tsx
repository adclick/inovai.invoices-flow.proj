
import React from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface RequiredTextFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder: string;
  type?: "text" | "email" | "number";
  disabled?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string;
}

const RequiredTextField = <TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
  disabled = false,
  min,
  max,
  step,
}: RequiredTextFieldProps<TFieldValues>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            {label}
            <span className="text-red-500">*</span>
          </FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              min={min}
              max={max}
              step={step}
              className="border-2 border-slate-200 dark:border-slate-600 focus:border-brand dark:focus:border-brand-light focus:ring-2 focus:ring-brand/20 transition-all duration-200 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
              {...field}
            />
          </FormControl>
          <FormMessage className="text-red-600 dark:text-red-400 text-xs font-medium" />
        </FormItem>
      )}
    />
  );
};

export default RequiredTextField;
