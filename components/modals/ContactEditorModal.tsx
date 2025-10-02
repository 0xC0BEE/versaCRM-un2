
import React, { useState, useEffect, useMemo } from 'react';
import { Contact, ContactStatus, CustomField, CustomFieldType, UploadedFile } from '../../types';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useNotification } from '../../hooks/useNotification';
import { useIndustryConfig } from '../../hooks/useIndustryConfig';
import Select from '../ui/Select';
import Icon from '../ui/Icon';

interface ContactEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null; // null for 'Add' mode, Contact object for 'Edit' mode
}

const ContactEditorModal: React.FC<ContactEditorModalProps> = ({ isOpen, onClose, contact }) => {
  const { currentUser } = useAuth();
  const industryConfig = useIndustryConfig();
  const { useAddContact, useUpdateContact, useTeamMembers } = useData();
  const addContactMutation = useAddContact();
  const updateContactMutation = useUpdateContact();
  const { addNotification } = useNotification();

  const { data: teamMembers } = useTeamMembers(currentUser?.organizationId);

  const [formData, setFormData] = useState<Partial<Contact>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = useMemo(() => !!contact, [contact]);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setFormData(JSON.parse(JSON.stringify(contact))); // Deep copy for editing
      } else {
        // Default values for a new contact
        setFormData({
          organizationId: currentUser?.organizationId,
          status: ContactStatus.Active,
          createdAt: new Date().toISOString(),
          lastContacted: new Date().toISOString(),
          lifecycleStage: 'Lead',
          leadSource: 'Manual Entry',
          tags: [],
          billingInfo: { accountBalance: 0, paymentMethod: 'Unspecified', nextBillingDate: null },
          address: { street: '', city: '', state: '', zip: '', country: 'USA' },
          customFields: {},
        });
      }
      setErrors({});
    }
  }, [contact, isEditMode, isOpen, currentUser]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Full Name is required.';
    if (!formData.email) {
        newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is not valid.';
    }

    // Validate required custom fields
    industryConfig?.schema.forEach(field => {
        if (field.required && !formData.customFields?.[field.name]) {
            newErrors[`customFields.${field.name}`] = `${field.label} is required.`;
        }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const fieldName = name.split('.')[1];

    setFormData(prev => {
        if (!prev) return prev;
        const updated = { ...prev };
        updated.customFields = { ...updated.customFields };

        if ((e.target as HTMLInputElement).type === 'file') {
            const files = (e.target as HTMLInputElement).files;
            if(files) {
                 updated.customFields[fieldName] = [...(updated.customFields[fieldName] || []), ...Array.from(files).map(f => ({ id: `file-${Date.now()}-${f.name}`, name: f.name, url: '#' }))];
            }
        } else {
            updated.customFields[fieldName] = value;
        }
        return updated;
    });
  };

   const handleRemoveFile = (fieldName: string, fileId: string) => {
    setFormData(prev => {
        if (!prev) return null;
        const updated = { ...prev, customFields: {...prev.customFields} };
        updated.customFields[fieldName] = updated.customFields[fieldName].filter((f: UploadedFile) => f.id !== fileId);
        return updated;
    });
  };

  const handleSubmit = () => {
    if (!validate()) {
        addNotification('Please fix the errors before saving.', 'error');
        return;
    }

    if (isEditMode) {
      updateContactMutation.mutate(formData as Contact, {
        onSuccess: () => {
          addNotification(`${industryConfig?.contactLabel.slice(0, -1)} updated successfully!`, 'success');
          onClose();
        },
        onError: (error) => addNotification(`Error: ${error.message}`, 'error'),
      });
    } else {
      addContactMutation.mutate(formData as Omit<Contact, 'id'>, {
        onSuccess: () => {
          addNotification(`${industryConfig?.contactLabel.slice(0, -1)} added successfully!`, 'success');
          onClose();
        },
        onError: (error) => addNotification(`Error: ${error.message}`, 'error'),
      });
    }
  };

  const isLoading = addContactMutation.isPending || updateContactMutation.isPending;
  const contactLabel = industryConfig?.contactLabel.slice(0, -1) || 'Contact';

  const renderCustomField = (field: CustomField) => {
      const fieldName = `customFields.${field.name}`;
      const fieldValue = formData.customFields?.[field.name];
      const error = errors[fieldName];

      switch(field.type) {
          case CustomFieldType.Text: return <Input key={field.name} label={field.label} name={fieldName} value={fieldValue || ''} onChange={handleCustomFieldChange} required={field.required} className={error ? 'border-danger' : ''} helperText={error}/>
          case CustomFieldType.Number: return <Input key={field.name} label={field.label} name={fieldName} type="number" value={fieldValue || ''} onChange={handleCustomFieldChange} required={field.required} className={error ? 'border-danger' : ''} helperText={error}/>
          case CustomFieldType.Date: return <Input key={field.name} label={field.label} name={fieldName} type="date" value={(fieldValue || '').split('T')[0]} onChange={handleCustomFieldChange} required={field.required} className={error ? 'border-danger' : ''} helperText={error}/>
          case CustomFieldType.Dropdown:
              return (
                  <div key={field.name}>
                    <Select label={field.label} name={fieldName} value={fieldValue || ''} onChange={handleCustomFieldChange} required={field.required} className={error ? 'border-danger' : ''}>
                        <option value="">Select...</option>
                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </Select>
                    {error && <p className="text-xs text-danger mt-1">{error}</p>}
                  </div>
              );
          case CustomFieldType.File:
              const currentFiles: UploadedFile[] = fieldValue || [];
              return (
                <div key={field.name}>
                  <Input label={field.label} name={fieldName} type="file" onChange={handleCustomFieldChange} multiple required={field.required} className={error ? 'border-danger' : ''} helperText={error}/>
                    {currentFiles.length > 0 && (
                      <div className="mt-2 space-y-2">
                          {currentFiles.map(file => (
                              <div key={file.id} className="flex items-center justify-between bg-bg-default p-2 rounded-md text-sm">
                                  <span className="text-text-secondary">{file.name}</span>
                                  <button onClick={() => handleRemoveFile(field.name, file.id)} className="text-danger p-1 rounded-full hover:bg-danger/10">
                                      <Icon name="close" className="w-3 h-3"/>
                                  </button>
                              </div>
                          ))}
                      </div>
                  )}
                </div>
              );
          default: return null;
      }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? `Edit ${contactLabel}` : `Add New ${contactLabel}`}
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} isLoading={isLoading} disabled={Object.keys(errors).length > 0 && isLoading}>
          {isEditMode ? 'Save Changes' : `Save ${contactLabel}`}
        </Button>
      </>}
    >
      <div className="space-y-4">
        <Input label="Full Name" name="name" value={formData.name || ''} onChange={handleChange} required className={errors.name ? 'border-danger' : ''} helperText={errors.name}/>
        <Input label="Email Address" name="email" type="email" value={formData.email || ''} onChange={handleChange} required className={errors.email ? 'border-danger' : ''} helperText={errors.email} />
        <Input label="Phone Number" name="phone" value={formData.phone || ''} onChange={handleChange} />
        <Select label={industryConfig?.fieldLabels.assignedToId || 'Assign To'} name="assignedToId" value={formData.assignedToId || ''} onChange={handleChange}>
            <option value="">Unassigned</option>
            {teamMembers?.map(member => (
                <option key={member.id} value={member.id}>{member.name}</option>
            ))}
        </Select>
        <Select label="Status" name="status" value={formData.status || ''} onChange={handleChange}>
            {Object.values(ContactStatus).map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
        {industryConfig?.schema.map(renderCustomField)}
      </div>
    </Modal>
  );
};

export default ContactEditorModal;
