import React, { useState, useEffect } from 'react';
import { Lead, Contact, ContactStatus, LeadStage } from '../../types';
import { useData } from '../../hooks/useData';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface ConvertLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
}

const ConvertLeadModal: React.FC<ConvertLeadModalProps> = ({ isOpen, onClose, lead }) => {
  const { currentUser } = useAuth();
  const { useAddContact, useUpdateLead } = useData();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const addContact = useAddContact();
  const updateLead = useUpdateLead();
  
  const [formData, setFormData] = useState<Partial<Contact>>({});

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name,
        email: lead.email,
        phone: '',
        status: ContactStatus.Active,
        organizationId: lead.organizationId,
        createdAt: new Date().toISOString(),
        lastContacted: new Date().toISOString(),
        lifecycleStage: 'Customer',
        leadSource: lead.source,
        tags: ['Converted'],
        assignedToId: lead.assignedToId,
        billingInfo: { accountBalance: 0, paymentMethod: 'Unspecified', nextBillingDate: null },
        address: { street: '', city: '', state: '', zip: '', country: 'USA' },
      });
    }
  }, [lead, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    addContact.mutate(formData as Omit<Contact, 'id'>, {
      onSuccess: (newPatient) => {
        // Mark lead as converted (optional, could be deleting it too)
        // FIX: Used LeadStage enum member instead of a string literal.
        updateLead.mutate({ ...lead, stage: LeadStage.Won });
        addNotification(`Successfully converted ${lead.name} to a patient.`, 'success');
        onClose();
        navigate(`/contacts/${newPatient.id}`);
      },
      onError: () => {
        addNotification(`Failed to convert ${lead.name}.`, 'error');
      }
    });
  };

  const isLoading = addContact.isPending || updateLead.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Convert ${lead.name} to Patient`}
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} isLoading={isLoading}>
          Convert to Patient
        </Button>
      </>}
    >
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">
            A new patient record will be created. Please confirm or update the details below.
        </p>
        <Input label="Full Name" name="name" value={formData.name || ''} onChange={handleChange} />
        <Input label="Email Address" name="email" type="email" value={formData.email || ''} onChange={handleChange} />
        <Input label="Phone Number (Optional)" name="phone" value={formData.phone || ''} onChange={handleChange} />
      </div>
    </Modal>
  );
};

export default ConvertLeadModal;
