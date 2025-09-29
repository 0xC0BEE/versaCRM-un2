
import React, { useState } from 'react';
import { UserRole } from '../../types';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { useNotification } from '../../hooks/useNotification';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { addNotification } = useNotification();
  const { useAddUser } = useData();
  const addUserMutation = useAddUser();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(UserRole.TeamMember);

  const handleSubmit = () => {
    if (!currentUser?.organizationId) return;

    addUserMutation.mutate({
        name,
        email,
        role,
        organizationId: currentUser.organizationId,
        avatarUrl: `https://i.pravatar.cc/150?u=${email}`
    }, {
        onSuccess: () => {
            addNotification(`Invitation sent to ${email}`, 'success');
            onClose();
        },
        onError: () => {
            addNotification('Failed to send invitation.', 'error');
        }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite New Team Member"
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} isLoading={addUserMutation.isPending}>Send Invite</Button>
      </>}
    >
      <div className="space-y-4">
        <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} />
        <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <Select label="Role" value={role} onChange={e => setRole(e.target.value as UserRole)}>
          <option value={UserRole.TeamMember}>Team Member</option>
          <option value={UserRole.OrgAdmin}>Organization Admin</option>
        </Select>
      </div>
    </Modal>
  );
};

export default InviteMemberModal;
