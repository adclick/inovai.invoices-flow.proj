
import React, { useState, useEffect, useRef } from "react";
import { Check, X, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/types/job";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface EditableCellProps {
  value: string | number | boolean | null | undefined;
  row: Job;
  column: keyof Job;
  onRowClick?: () => void;
}

export const EditableCell: React.FC<EditableCellProps> = ({
  value,
  row,
  column,
  onRowClick,
}) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<any>(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const updateJobMutation = useMutation({
    mutationFn: async (data: { id: string; [key: string]: any }) => {
      const { error } = await supabase
        .from("jobs")
        .update({ [column]: data[column] })
        .eq("id", data.id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast({
        title: t("jobs.updateSuccess"),
        description: t("jobs.jobUpdatedDescription"),
      });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Error updating job:", error);
      toast({
        title: t("common.error"),
        description: t("jobs.updateError"),
        variant: "destructive",
      });
      setEditValue(value); // Reset to original value
    },
  });

  const handleCellClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (value === editValue) {
      setIsEditing(false);
      return;
    }
    
    updateJobMutation.mutate({
      id: row.id,
      [column]: editValue,
    });
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const renderEditMode = () => {
    switch (column) {
      case "status":
        return (
          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
            <Select
              value={editValue as string}
              onValueChange={(value) => setEditValue(value)}
              onOpenChange={(open) => {
                if (!open) {
                  setTimeout(handleSave, 100);
                }
              }}
              open={true}
            >
              <SelectTrigger className="h-8 w-full" autoFocus>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">{t("jobs.draft")}</SelectItem>
                <SelectItem value="active">{t("jobs.active")}</SelectItem>
                <SelectItem value="pending_invoice">{t("jobs.pendingInvoice")}</SelectItem>
                <SelectItem value="pending_validation">{t("jobs.pendingValidation")}</SelectItem>
                <SelectItem value="pending_payment">{t("jobs.pendingPayment")}</SelectItem>
                <SelectItem value="paid">{t("jobs.paid")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      
      case "paid":
        return (
          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
            <Select
              value={String(editValue)}
              onValueChange={(value) => {
                setEditValue(value === "true");
                setTimeout(() => {
                  updateJobMutation.mutate({
                    id: row.id,
                    [column]: value === "true",
                  });
                }, 100);
              }}
              open={true}
            >
              <SelectTrigger className="h-8 w-full" autoFocus>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">{t("common.yes")}</SelectItem>
                <SelectItem value="false">{t("common.no")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      
      case "value":
        return (
          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
            <Input
              ref={inputRef}
              type="number"
              value={editValue as string}
              onChange={(e) => setEditValue(parseFloat(e.target.value))}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              className="h-8 w-24"
              autoFocus
            />
          </div>
        );
      
      case "due_date":
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Popover open={true} onOpenChange={(open) => {
              if (!open) handleSave();
            }}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-8 w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {editValue ? format(new Date(editValue as string), "PPP") : <span>{t("common.pickDate")}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={editValue ? new Date(editValue as string) : undefined}
                  onSelect={(date) => {
                    setEditValue(date?.toISOString());
                    if (date) {
                      setTimeout(() => {
                        updateJobMutation.mutate({
                          id: row.id,
                          [column]: date.toISOString(),
                        });
                      }, 100);
                    }
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
            <Input
              ref={inputRef}
              type="text"
              value={editValue as string}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              className="h-8"
              autoFocus
            />
            <div className="flex space-x-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={handleSave}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={handleCancel}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
    }
  };

  const formatCellValue = () => {
    if (value === null || value === undefined) return "-";

    switch (column) {
      case "status":
        return row.status ? t(`jobs.${row.status.replace(/_/g, "")}`) : value;
      case "paid":
        return Boolean(value) ? t("common.yes") : t("common.no");
      case "value":
        const currency = row.currency || "euro";
        const symbols: Record<string, string> = {
          euro: "€",
          usd: "$",
          gbp: "£"
        };
        const symbol = symbols[currency.toLowerCase()] || currency;
        return `${symbol}${Number(value).toLocaleString()}`;
      case "due_date":
        return value ? format(new Date(value as string), "PPP") : "-";
      default:
        return String(value);
    }
  };

  if (isEditing) {
    return (
      <div onClick={(e) => e.stopPropagation()}>
        {renderEditMode()}
      </div>
    );
  }

  return (
    <div 
      className="w-full h-full cursor-pointer group" 
      onClick={handleCellClick}
    >
      <div className="flex items-center justify-between">
        <span>{formatCellValue()}</span>
      </div>
    </div>
  );
};
