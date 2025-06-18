
import React from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EntitySelectOption } from "@/utils/formConstants";

interface OptionalEntitySelectFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder: string;
  options: EntitySelectOption[];
  disabled?: boolean;
  emptyMessage?: string;
}

const OptionalEntitySelectField = <TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  options,
  disabled = false,
  emptyMessage,
}: OptionalEntitySelectFieldProps<TFieldValues>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {label}
          </FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger className="border-2 border-slate-200 dark:border-slate-600 focus:border-primary dark:focus:border-sidebar-accent focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-600">
              {options && options.length > 0 ? (
                options.map((option) => (
                  <SelectItem
                    key={option.id}
                    value={option.id}
                    className="hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    {option.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-options" disabled>
                  {emptyMessage || "No options available"}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage className="text-red-600 dark:text-red-400 text-xs font-medium" />
        </FormItem>
      )}
    />
  );
};

export default OptionalEntitySelectField;
