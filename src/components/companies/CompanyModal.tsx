
import React from "react";
import { useTranslation } from "react-i18next";
import { EntityModal } from "../common/EntityModal";
import CompanyForm from "./CompanyForm";
import { useModalState } from "@/hooks/useModalState";

export const CompanyModal: React.FC = () => {
  const { t } = useTranslation();
  const { modalState, closeModal } = useModalState();
  
  if (!modalState.isOpen || modalState.type !== 'company') {
    return null;
  }

  const isCreateMode = modalState.mode === 'create';
  const title = isCreateMode ? t("companies.createNew") : t("companies.editCompany");
  const description = isCreateMode 
    ? t("companies.createDescription")
    : t("companies.updateDescription");

  return (
    <EntityModal
      title={title}
      description={description}
    >
      <CompanyForm
        mode={modalState.mode || 'create'}
        id={modalState.id || undefined}
        onClose={closeModal}
      />
    </EntityModal>
  );
};

export default CompanyModal;
