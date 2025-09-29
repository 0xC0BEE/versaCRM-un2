
import React, { useState, useEffect } from 'react';
import { Organization, Industry } from '../../types';
import { useData } from '../../hooks/useData';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

interface OrgEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization | null;
}

const OrgEditorModal: React.FC<OrgEditorModalProps> = ({ isOpen, onClose, organization }) => {
  const { useAddOrganization, useUpdateOrganization } = useData();
  const addOrg = useAddOrganization();
  const updateOrg = useUpdateOrganization();
  
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState<Industry>(Industry.Healthcare);

  useEffect(() => {
    if (organization) {
      setName(organization.name);
      setIndustry(organization.industry);
    } else {
      setName('');
      setIndustry(Industry.Healthcare);
    }
  }, [organization, isOpen]);

  const handleSubmit = () => {
    const data = { name, industry };
    if (organization) {
      updateOrg.mutate({ ...organization, ...data }, { onSuccess: onClose });
    } else {
      addOrg.mutate(data, { onSuccess: onClose });
    }
  };

  const isLoading = addOrg.isPending || updateOrg.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={organization ? 'Edit Organization' : 'Add Organization'}
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} isLoading={isLoading}>Save</Button>
      </>}
    >
      <div className="space-y-4">
        <Input label="Organization Name" value={name} onChange={e => setName(e.target.value)} />
        <Select label="Industry" value={industry} onChange={e => setIndustry(e.target.value as Industry)}>
          {Object.values(Industry).map(ind => <option key={ind} value={ind}>{ind}</option>)}
        </Select>
      </div>
    </Modal>
  );
};

export default OrgEditorModal;
