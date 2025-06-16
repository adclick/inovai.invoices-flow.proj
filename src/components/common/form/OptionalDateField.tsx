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

interface OptionalDateFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

const OptionalDateField = <TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  disabled = false,
}: OptionalDateFieldProps<TFieldValues>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Format the date value for the HTML date input (YYYY-MM-DD)
        const formattedValue = field.value 
          ? new Date(field.value).toISOString().split('T')[0]
          : "";

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Input
                type="date"
                placeholder={placeholder}
                disabled={disabled}
                {...field}
                value={formattedValue}
                onChange={(e) => {
                  // Convert the date string back to ISO format when changed
                  const date = e.target.value ? new Date(e.target.value).toISOString() : "";
                  field.onChange(date);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default OptionalDateField; 