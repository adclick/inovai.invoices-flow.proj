
import React from "react";
import { useTranslation } from "react-i18next";
import { EntityModal } from "../common/EntityModal";
import ManagerForm from "./ManagerForm";
import { useModalState } from "@/hooks/useModalState";

export const ManagerModal: React.FC = () => {
  const { t } = useTranslation();
  const { modalState, closeModal } = useModalState();
  
  // Only render if the modal is open and it's for managers
  if (!modalState.isOpen || modalState.type !== 'manager') {
    return null;
  }

  const isCreateMode = modalState.mode === 'create';
  const title = isCreateMode ? t("managers.createNew") : t("managers.editManager");
  const description = isCreateMode 
    ? t("managers.createDescription")
    : t("managers.updateDescription");

  return (
    <EntityModal
      title={title}
      description={description}
    >
      <ManagerForm
        mode={modalState.mode || 'create'}
        id={modalState.id || undefined}
        onClose={closeModal}
      />
    </EntityModal>
  );
};

export default ManagerModal;
