
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

interface EntitySelectFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder: string;
  options: EntitySelectOption[];
  isLoading?: boolean;
  disabled?: boolean;
  emptyMessage?: string;
  onValueChange?: (value: string) => void;
}

const EntitySelectField = <TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  options,
  isLoading = false,
  disabled = false,
  emptyMessage = "No items available",
  onValueChange,
}: EntitySelectFieldProps<TFieldValues>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            onValueChange={(value) => {
              field.onChange(value);
              onValueChange?.(value);
            }}
            value={field.value}
            disabled={disabled || isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options && options.length > 0 ? (
                options.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-items" disabled>
                  {emptyMessage}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default EntitySelectField;
