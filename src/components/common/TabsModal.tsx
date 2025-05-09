
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useModalState } from "@/hooks/useModalState";

export interface TabDefinition {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsModalProps {
  title?: string;
  description?: React.ReactNode;
  tabs: TabDefinition[];
  defaultTab?: string;
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

export const TabsModal: React.FC<TabsModalProps> = ({
  title,
  description,
  tabs,
  defaultTab,
  className = "",
  size = "xl"
}) => {
  const { modalState, closeModal } = useModalState();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>(
    defaultTab || (tabs.length > 0 ? tabs[0].id : "")
  );

  const maxWidthClass = sizeClasses[size] || sizeClasses.xl;

  return (
    <Dialog open={modalState.isOpen} onOpenChange={(open) => {
      if (!open) closeModal();
    }}>
      <DialogContent className={`${maxWidthClass} p-0 ${className}`}>
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeModal}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">{t("common.close")}</span>
            </Button>
          </div>
          {description && <div className="text-sm text-muted-foreground mt-1">{description}</div>}
        </DialogHeader>

        <div className="border-b border-slate-200 dark:border-slate-700">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {tabs.map(tab => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-10rem)]">
          {tabs.find(tab => tab.id === activeTab)?.content}
        </div>
      </DialogContent>
    </Dialog>
  );
};
