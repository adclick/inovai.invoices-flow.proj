
import React from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EntityType, ModalMode, useModalState } from "@/hooks/useModalState";

interface EntityModalProps {
  title?: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "full";
}

// Map of sizes to max-width classes
const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  "8xl": "max-w-8xl",
  full: "max-w-[calc(100vw-2rem)] overflow-y-auto h-[calc(100vh-2rem)]" 
};

export const EntityModal: React.FC<EntityModalProps> = ({
  title,
  description,
  children,
  className = "",
  size = "2xl"
}) => {
  const { modalState, closeModal } = useModalState();
  const { t } = useTranslation();
  
  const maxWidthClass = sizeClasses[size] || sizeClasses.lg;

  return (
    <Dialog open={modalState.isOpen} onOpenChange={(open) => {
      if (!open) closeModal();
    }}>
      <DialogContent className={`${maxWidthClass} ${className} border-slate-200 dark:border-slate-700 shadow-xl`}>
        <DialogHeader className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-primary/5 to-sidebar-accent/5 dark:from-primary/10 dark:to-sidebar-accent/10 -m-6 px-6 pt-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100 bg-gradient-to-r from-primary to-sidebar-accent bg-clip-text text-transparent">
              {title}
            </DialogTitle>
          </div>
          {description && (
            <div className="text-sm text-slate-600 dark:text-slate-300 mt-2 font-medium">
              {description}
            </div>
          )}
        </DialogHeader>
        <div className="overflow-y-auto max-h-[calc(100vh)] px-1 space-y-6">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export interface BaseEntityFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  id?: string;
  mode: ModalMode;
}
