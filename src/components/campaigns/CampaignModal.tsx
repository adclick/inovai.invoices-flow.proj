
import React from "react";
import { useTranslation } from "react-i18next";
import { EntityModal } from "../common/EntityModal";
import CampaignForm from "./CampaignForm";
import { useModalState } from "@/hooks/useModalState";

export const CampaignModal: React.FC = () => {
  const { t } = useTranslation();
  const { modalState, closeModal } = useModalState();
  
  // Only render if the modal is open and it's for campaigns
  if (!modalState.isOpen || modalState.type !== 'campaign') {
    return null;
  }

  const isCreateMode = modalState.mode === 'create';
  const title = isCreateMode ? t("campaigns.createNew") : t("campaigns.editCampaign");
  const description = isCreateMode 
    ? t("campaigns.createDescription")
    : t("campaigns.updateDescription");

  return (
    <EntityModal
      title={title}
      description={description}
      size="md"
    >
      <CampaignForm
        mode={modalState.mode || 'create'}
        id={modalState.id || undefined}
        onClose={closeModal}
      />
    </EntityModal>
  );
};

export default CampaignModal;
