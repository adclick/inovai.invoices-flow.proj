
import React from "react";
import { useTranslation } from "react-i18next";
import { EntityModal } from "../common/EntityModal";
import JobTypeForm from "./JobTypeForm";
import { useModalState } from "@/hooks/useModalState";

export const JobTypeModal: React.FC = () => {
  const { t } = useTranslation();
  const { modalState, closeModal } = useModalState();
  
  // Only render if the modal is open and it's for job types
  if (!modalState.isOpen || modalState.type !== 'jobType') {
    return null;
  }

  const isCreateMode = modalState.mode === 'create';
  const title = isCreateMode ? t("jobTypes.createJobType") : t("jobTypes.editJobType");
  const description = isCreateMode 
    ? t("jobTypes.createJobTypeDescription")
    : t("jobTypes.editJobTypeDescription");

  return (
    <EntityModal
      title={title}
      description={description}
    >
      <JobTypeForm
        mode={modalState.mode || 'create'}
        id={modalState.id || undefined}
        onClose={closeModal}
      />
    </EntityModal>
  );
};

export default JobTypeModal;
