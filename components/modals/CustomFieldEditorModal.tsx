import React, { useState, useEffect } from 'react';
import { CustomField, CustomFieldType } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

interface CustomFieldEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (field: CustomField) => void;
  field: CustomField | null;
}

const CustomFieldEditorModal: React.FC<CustomFieldEditorModalProps> = ({ isOpen, onClose, onSave, field }) => {
  const [label, setLabel] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<CustomFieldType>(CustomFieldType.Text);
  const [options, setOptions] = useState(''); // Comma-separated for dropdown

  useEffect(() => {
    if (field) {
      setLabel(field.label);
      setName(field.name);
      setType(field.type);
      setOptions(field.options?.join(', ') || '');
    } else {
      // Reset form
      setLabel('');
      setName('');
      setType(CustomFieldType.Text);
      setOptions('');
    }
  }, [field, isOpen]);

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value;
    setLabel(newLabel);
    // Auto-generate name from label (camelCase)
    if (!field) { // Only auto-generate for new fields
      const newName = newLabel
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_m, chr) => chr.toUpperCase())
        .replace(/ /g, '');
      setName(newName);
    }
  };

  const handleSubmit = () => {
    const finalField: CustomField = {
      label,
      name,
      type,
    };
    if (type === CustomFieldType.Dropdown) {
      finalField.options = options.split(',').map(o => o.trim()).filter(Boolean);
    }
    onSave(finalField);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={field ? 'Edit Custom Field' : 'Add Custom Field'}
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Save Field</Button>
      </>}
    >
      <div className="space-y-4">
        <Input label="Field Label" value={label} onChange={handleLabelChange} placeholder="e.g., Patient Allergies" />
        <Input label="Field Name (ID)" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., patientAllergies" helperText="This is the unique ID for the field. It cannot be changed after creation." disabled={!!field} />
        <Select label="Field Type" value={type} onChange={e => setType(e.target.value as CustomFieldType)}>
          {Object.values(CustomFieldType).map(t => <option key={t} value={t}>{t}</option>)}
        </Select>
        {type === CustomFieldType.Dropdown && (
          <Input label="Options" value={options} onChange={e => setOptions(e.target.value)} helperText="Enter options separated by commas." placeholder="e.g., Option 1, Option 2, Option 3"/>
        )}
      </div>
    </Modal>
  );
};

export default CustomFieldEditorModal;