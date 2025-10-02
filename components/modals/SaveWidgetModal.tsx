
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface SaveWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  isLoading?: boolean;
}

const SaveWidgetModal: React.FC<SaveWidgetModalProps> = ({ isOpen, onClose, onSave, isLoading }) => {
  const [name, setName] = useState('');

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Save Report as Widget"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} isLoading={isLoading} disabled={!name.trim()}>
            Save Widget
          </Button>
        </>
      }
    >
      <Input
        label="Widget Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g., Monthly New Contacts"
        autoFocus
      />
    </Modal>
  );
};

export default SaveWidgetModal;
