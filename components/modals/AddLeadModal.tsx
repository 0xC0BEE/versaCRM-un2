
import React, { useState, useEffect } from 'react';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
// FIX: Added LeadStage to imports and used it for the default stage to fix the type error.
import { Lead, LeadStage } from '../../types';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { useAddLead, useTeamMembers } = useData();
  const addLeadMutation = useAddLead();
  const { data: teamMembers } = useTeamMembers(currentUser?.organizationId);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Omit<Lead, 'id'>>>({
      organizationId: currentUser?.organizationId,
      // FIX: The stage property now correctly uses the LeadStage enum, resolving a type error.
      stage: LeadStage.New,
      createdAt: new Date().toISOString(),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: name === 'value' ? parseFloat(value) : value }));
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = () => {
      addLeadMutation.mutate(formData as Omit<Lead, 'id'>, {
          onSuccess: () => {
              onClose();
              setStep(1);
              // FIX: The stage property now correctly uses the LeadStage enum, resolving a type error.
              setFormData({ stage: LeadStage.New, organizationId: currentUser?.organizationId });
          }
      });
  };
  
  const renderStep = () => {
      switch(step) {
          case 1:
              return (
                  <div className="space-y-4">
                      <Input label="Lead Name" name="name" value={formData.name || ''} onChange={handleChange} />
                      <Input label="Email Address" name="email" type="email" value={formData.email || ''} onChange={handleChange} />
                      <Input label="Source (e.g., Website, Referral)" name="source" value={formData.source || ''} onChange={handleChange} />
                  </div>
              );
          case 2:
              return (
                  <div className="space-y-4">
                      <Input label="Deal Value ($)" name="value" type="number" value={formData.value || ''} onChange={handleChange} />
                      <Select label="Assigned To" name="assignedToId" value={formData.assignedToId || ''} onChange={handleChange}>
                          <option value="">Unassigned</option>
                          {teamMembers?.map(member => (
                              <option key={member.id} value={member.id}>{member.name}</option>
                          ))}
                      </Select>
                  </div>
              );
          default:
              return null;
      }
  }

  const footer = (
    <>
      {step > 1 && <Button variant="secondary" onClick={handleBack}>Back</Button>}
      {step < 2 && <Button onClick={handleNext} disabled={!formData.name || !formData.email}>Next</Button>}
      {step === 2 && <Button onClick={handleSubmit} isLoading={addLeadMutation.isPending}>Create Lead</Button>}
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Create New Lead (Step ${step} of 2)`}
      footer={footer}
    >
        {renderStep()}
    </Modal>
  );
};

export default AddLeadModal;
