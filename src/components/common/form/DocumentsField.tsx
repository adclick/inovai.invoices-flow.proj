import React from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface DocumentsFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  helpText?: string;
  disabled?: boolean;
  rows?: number;
}

const DocumentsField = <TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  helpText,
  disabled = false,
  rows = 4,
}: DocumentsFieldProps<TFieldValues>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              placeholder={placeholder}
              disabled={disabled}
              rows={rows}
              className="resize-none"
              value={value?.join(", ") || ""}
              onChange={(e) => {
                const urls = e.target.value
                  .split(",")
                  .map(url => url.trim())
                  .filter(url => url.length > 0);
                onChange(urls);
              }}
            />
          </FormControl>
          {helpText && (
            <p className="text-xs text-muted-foreground">
              {helpText}
            </p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DocumentsField; 