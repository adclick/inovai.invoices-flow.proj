
import React from "react";
import { useTranslation } from "react-i18next";
import { EntityModal } from "../common/EntityModal";
import ProviderForm from "./ProviderForm";
import { useModalState } from "@/hooks/useModalState";

export const ProviderModal: React.FC = () => {
  const { t } = useTranslation();
  const { modalState, closeModal } = useModalState();
  
  // Only render if the modal is open and it's for providers
  if (!modalState.isOpen || modalState.type !== 'provider') {
    return null;
  }

  const isCreateMode = modalState.mode === 'create';
  const title = isCreateMode ? t("providers.createNew") : t("providers.editProvider");
  const description = isCreateMode 
    ? t("providers.createDescription")
    : t("providers.updateDescription");

  return (
    <EntityModal
      title={title}
      description={description}
      size="md"
    >
      <ProviderForm
        mode={modalState.mode || 'create'}
        id={modalState.id || undefined}
        onClose={closeModal}
      />
    </EntityModal>
  );
};

export default ProviderModal;
