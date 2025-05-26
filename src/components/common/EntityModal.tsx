
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
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

// Map of sizes to max-width classes
const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-[calc(100vw-2rem)]" 
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
      <DialogContent className={`${maxWidthClass} ${className}`}>
        <DialogHeader className="mb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          </div>
          {description && <div className="text-sm text-muted-foreground mt-1">{description}</div>}
        </DialogHeader>
        <div className="overflow-y-auto max-h-[calc(80vh-10rem)] px-1">{children}</div>
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
