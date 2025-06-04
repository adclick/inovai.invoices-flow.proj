
import React from "react";
import { Control, Controller } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface MultiSelectOption {
  id: string;
  name: string;
}

interface MultiSelectFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  placeholder: string;
  options: MultiSelectOption[];
  disabled?: boolean;
  emptyMessage?: string;
}

const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  control,
  name,
  label,
  placeholder,
  options,
  disabled = false,
  emptyMessage = "No options available",
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className={cn(
              "min-h-[40px] rounded-md border border-input bg-background px-3 py-2",
              disabled && "opacity-50 cursor-not-allowed"
            )}>
              {disabled ? (
                <div className="text-muted-foreground text-sm py-1">
                  {placeholder}
                </div>
              ) : options.length === 0 ? (
                <div className="text-muted-foreground text-sm py-1">
                  {emptyMessage}
                </div>
              ) : (
                <ScrollArea className="max-h-32">
                  <div className="space-y-2">
                    {options.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${name}-${option.id}`}
                          checked={field.value?.includes(option.id) || false}
                          onCheckedChange={(checked) => {
                            const currentValue = field.value || [];
                            if (checked) {
                              field.onChange([...currentValue, option.id]);
                            } else {
                              field.onChange(currentValue.filter((id: string) => id !== option.id));
                            }
                          }}
                        />
                        <label
                          htmlFor={`${name}-${option.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {option.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default MultiSelectField;
