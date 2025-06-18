
import { useMemo } from "react";
import { UseFormWatch } from "react-hook-form";
import { JobFormValues } from "./types";

export const useJobFormCalculations = (watch: UseFormWatch<JobFormValues>) => {
  // Calculate total value from line items
  const totalValue = useMemo(() => {
    const lineItems = watch("line_items");
    return lineItems?.reduce((sum, item) => sum + (Number(item.value) || 0), 0) || 0;
  }, [watch("line_items")]);

  // Check if line items exist for status restrictions
  const hasLineItems = useMemo(() => {
    const lineItems = watch("line_items");
    return lineItems && lineItems.length > 0;
  }, [watch("line_items")]);

  return {
    totalValue,
    hasLineItems,
  };
};
