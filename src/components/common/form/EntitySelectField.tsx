
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
  multiple?: boolean;
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
  multiple = false,
}: EntitySelectFieldProps<TFieldValues>) => {
  if (multiple) {
    // For multiple selection, we'll use a different approach
    return (
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <div className="space-y-2">
                {options && options.length > 0 ? (
                  options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`${name}-${option.id}`}
                        checked={field.value?.includes(option.id) || false}
                        onChange={(e) => {
                          const currentValue = field.value || [];
                          if (e.target.checked) {
                            const newValue = [...currentValue, option.id];
                            field.onChange(newValue);
                            onValueChange?.(option.id);
                          } else {
                            const newValue = currentValue.filter((id: string) => id !== option.id);
                            field.onChange(newValue);
                          }
                        }}
                        disabled={disabled || isLoading}
                        className="rounded"
                      />
                      <label htmlFor={`${name}-${option.id}`} className="text-sm">
                        {option.name}
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">{emptyMessage}</div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

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
