
import React from "react";
import { useTranslation } from "react-i18next";
import { EntityModal } from "../common/EntityModal";
import JobForm from "./JobForm";
import { useModalState } from "@/hooks/useModalState";

export const JobModal: React.FC = () => {
  const { t } = useTranslation();
  const { modalState, closeModal } = useModalState();
  
  // Only render if the modal is open and it's for jobs
  if (!modalState.isOpen || modalState.type !== 'job') {
    return null;
  }

  const isCreateMode = modalState.mode === 'create';
  const title = isCreateMode ? t("jobs.createNew") : t("jobs.editJob");

  return (
    <EntityModal
      title={title}
    >
      <JobForm
        mode={modalState.mode || 'create'}
        id={modalState.id || undefined}
        onClose={closeModal}
      />
    </EntityModal>
  );
};

export default JobModal;
