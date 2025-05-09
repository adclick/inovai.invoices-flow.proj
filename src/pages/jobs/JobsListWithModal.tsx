
import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useModalState } from "@/hooks/useModalState";
import JobsRouter from "./JobsRouter";
import JobModal from "@/components/jobs/JobModal";

const JobsListWithModal: React.FC = () => {
  const { t } = useTranslation();
  const { openModal } = useModalState();

  const handleCreateJob = () => {
    openModal("job", "create");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t("jobs.title")}</h1>
        <Button onClick={handleCreateJob}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t("jobs.createNew")}
        </Button>
      </div>
      <JobsRouter />
      <JobModal />
    </div>
  );
};

export default JobsListWithModal;
