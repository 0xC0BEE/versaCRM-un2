import React, { useState } from 'react';
import { Contact, Sequence } from '../../types';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { useNotification } from '../../hooks/useNotification';

interface EnrollContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
}

const EnrollContactModal: React.FC<EnrollContactModalProps> = ({ isOpen, onClose, contact }) => {
    const { currentUser } = useAuth();
    const { useSequences, useEnrollContactInSequence } = useData();
    const { addNotification } = useNotification();
    const { data: sequences, isLoading: sequencesLoading } = useSequences(currentUser?.organizationId);
    const enrollMutation = useEnrollContactInSequence();

    const [selectedSequenceId, setSelectedSequenceId] = useState('');

    const handleSubmit = () => {
        if (!selectedSequenceId) {
            addNotification('Please select a sequence.', 'error');
            return;
        }
        
        const selectedSequence = sequences?.find(s => s.id === selectedSequenceId);
        if (!selectedSequence) return;

        enrollMutation.mutate({
            contactId: contact.id,
            sequenceId: selectedSequenceId,
            organizationId: currentUser!.organizationId,
            userId: currentUser!.id,
            sequenceName: selectedSequence.name,
        }, {
            onSuccess: () => {
                addNotification(`${contact.name} enrolled in "${selectedSequence.name}".`, 'success');
                onClose();
            },
            onError: (err) => {
                addNotification(`Failed to enroll: ${err.message}`, 'error');
            }
        });
    };

    const isLoading = sequencesLoading || enrollMutation.isPending;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Enroll ${contact.name} in a Sequence`}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} isLoading={isLoading} disabled={!selectedSequenceId}>
                        Enroll Contact
                    </Button>
                </>
            }
        >
            <div className="space-y-4">
                <Select
                    label="Choose a sequence"
                    value={selectedSequenceId}
                    onChange={e => setSelectedSequenceId(e.target.value)}
                >
                    <option value="">Select a sequence...</option>
                    {sequences?.map(seq => (
                        <option key={seq.id} value={seq.id}>{seq.name}</option>
                    ))}
                </Select>
                 {sequences?.length === 0 && !sequencesLoading && (
                    <p className="text-center text-text-secondary py-4">No sequences have been created yet. Please create one from the Sequences page.</p>
                )}
            </div>
        </Modal>
    );
};

export default EnrollContactModal;
