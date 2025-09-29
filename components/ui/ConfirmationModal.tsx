import React from 'react';
import Modal from './Modal';
import Button from './Button';
import Icon from './Icon';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  isDestructive?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  isDestructive = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex items-start gap-4">
          <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${isDestructive ? 'bg-danger/10' : 'bg-primary/10'} sm:mx-0 sm:h-10 sm:w-10`}>
              <Icon name={isDestructive ? 'trash' : 'bell'} className={isDestructive ? 'text-danger' : 'text-primary'} />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <p className="text-lg leading-6 font-medium text-text-default">{title}</p>
              <div className="mt-2">
                  <p className="text-sm text-text-secondary">{message}</p>
              </div>
          </div>
      </div>
       <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <Button
          variant={isDestructive ? 'danger' : 'primary'}
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="w-full sm:ml-3 sm:w-auto"
        >
          {confirmText}
        </Button>
        <Button
          variant="secondary"
          onClick={onClose}
          className="mt-3 w-full sm:mt-0 sm:w-auto"
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;