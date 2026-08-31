import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useLanguage } from '../context/LanguageContext';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName
}) => {
  const { t } = useLanguage();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || t('confirmDeleteTitle')}
      maxWidth="460px"
    >
      <div className="modal-body" style={{ textAlign: 'center', padding: '30px 24px 20px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '14px', color: 'var(--danger)' }}>
          <i className="ri-error-warning-line"></i>
        </div>
        <p style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>
          {message || t('confirmDeleteMessage')}
        </p>
        {itemName && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              color: '#fca5a5',
              fontSize: '0.9rem',
              fontWeight: 500
            }}
          >
            "{itemName}"
          </div>
        )}
      </div>
      <div className="modal-footer" style={{ justifyContent: 'center' }}>
        <Button variant="secondary" onClick={onClose} icon={<i className="ri-close-line"></i>}>
          {t('cancel')}
        </Button>
        <Button variant="danger" onClick={onConfirm} icon={<i className="ri-delete-bin-line"></i>}>
          {t('confirmDelete')}
        </Button>
      </div>
    </Modal>
  );
};
