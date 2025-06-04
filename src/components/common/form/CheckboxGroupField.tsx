
import React from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectOption } from "@/utils/formConstants";

interface CheckboxGroupFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  description?: string;
  options: SelectOption[];
  disabled?: boolean;
}

const CheckboxGroupField = <TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  options,
  disabled = false,
}: CheckboxGroupFieldProps<TFieldValues>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem>
          <div className="mb-4">
            <FormLabel>{label}</FormLabel>
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            {options.map((option) => (
              <FormField
                key={option.value}
                control={control}
                name={name}
                render={({ field }) => {
                  return (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(option.value)}
                          disabled={disabled}
                          onCheckedChange={(checked) =>
                            checked
                              ? field.onChange([...field.value, option.value])
                              : field.onChange(
                                  field.value?.filter(
                                    (value: string) => value !== option.value
                                  )
                                )
                          }
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        {option.label}
                      </FormLabel>
                    </FormItem>
                  );
                }}
              />
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CheckboxGroupField;
