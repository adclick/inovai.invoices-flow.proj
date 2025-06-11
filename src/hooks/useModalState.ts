import { useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export type EntityType = 'client' | 'campaign' | 'provider' | 'manager' | 'job' | 'jobType' | 'company';
export type ModalMode = 'create' | 'edit' | 'view';

export interface ModalState {
  isOpen: boolean;
  type: EntityType | null;
  mode: ModalMode | null;
  id: string | null;
}

export function useModalState(): {
  modalState: ModalState;
  openModal: (type: EntityType, mode: ModalMode, id?: string) => void;
  closeModal: () => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const modal = searchParams.get('modal');
  const id = searchParams.get('id');

  // Parse the modal parameter (format: mode-type, e.g., "edit-client")
  let type: EntityType | null = null;
  let mode: ModalMode | null = null;

  if (modal) {
    const parts = modal.split('-');
    if (parts.length === 2) {
      const [modalMode, modalType] = parts;
      if (
        ['create', 'edit', 'view'].includes(modalMode) &&
        ['client', 'campaign', 'provider', 'manager', 'job', 'jobType', 'company'].includes(modalType)
      ) {
        mode = modalMode as ModalMode;
        type = modalType as EntityType;
      }
    }
  }

  const modalState: ModalState = {
    isOpen: Boolean(modal),
    type,
    mode,
    id,
  };

  const openModal = useCallback(
    (type: EntityType, mode: ModalMode, id?: string) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('modal', `${mode}-${type}`);
      if (id) {
        newParams.set('id', id);
      } else {
        newParams.delete('id');
      }
      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const closeModal = useCallback(() => {
    const currentPath = window.location.pathname;
    navigate(currentPath, { replace: true });
  }, [navigate]);

  return { modalState, openModal, closeModal };
}
