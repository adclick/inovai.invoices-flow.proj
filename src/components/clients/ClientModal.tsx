
import React from "react";
import { useTranslation } from "react-i18next";
import { EntityModal } from "../common/EntityModal";
import ClientForm from "./ClientForm";
import { useModalState } from "@/hooks/useModalState";

export const ClientModal: React.FC = () => {
  const { t } = useTranslation();
  const { modalState, closeModal } = useModalState();
  
  // Only render if the modal is open and it's for clients
  if (!modalState.isOpen || modalState.type !== 'client') {
    return null;
  }

  const isCreateMode = modalState.mode === 'create';
  const title = isCreateMode ? t("clients.createNew") : t("clients.editClient");
  const description = isCreateMode 
    ? t("clients.createDescription")
    : t("clients.updateDescription");

  return (
    <EntityModal
      title={title}
      description={description}
    >
      <ClientForm
        mode={modalState.mode || 'create'}
        id={modalState.id || undefined}
        onClose={closeModal}
      />
    </EntityModal>
  );
};

export default ClientModal;
