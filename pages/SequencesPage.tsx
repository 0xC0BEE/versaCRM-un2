import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { Sequence } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import Spinner from '../components/ui/Spinner';
import SequenceEditorModal from '../components/modals/SequenceEditorModal';
import ConfirmationModal from '../components/ui/ConfirmationModal';

const SequencesPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { useSequences, useDeleteSequence } = useData();
    const { data: sequences, isLoading, error } = useSequences(currentUser?.organizationId);
    const deleteSequenceMutation = useDeleteSequence();

    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedSequence, setSelectedSequence] = useState<Sequence | null>(null);

    const handleAdd = () => {
        setSelectedSequence(null);
        setIsEditorOpen(true);
    };

    const handleEdit = (sequence: Sequence) => {
        setSelectedSequence(sequence);
        setIsEditorOpen(true);
    };

    const handleDeleteRequest = (sequence: Sequence) => {
        setSelectedSequence(sequence);
        setIsDeleteOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (selectedSequence) {
            deleteSequenceMutation.mutate(selectedSequence.id);
            setIsDeleteOpen(false);
        }
    };

    if (isLoading) return <Spinner />;
    if (error) return <p className="text-danger">Error loading sequences.</p>;

    return (
        <>
            <Card
                title="Marketing Sequences"
                actions={<Button onClick={handleAdd}><Icon name="plus" /> New Sequence</Button>}
            >
                <div className="space-y-4">
                    {sequences?.map(seq => (
                        <div key={seq.id} className="p-4 border border-border-default rounded-lg flex justify-between items-center bg-bg-default">
                            <div>
                                <h3 className="font-semibold text-text-default">{seq.name}</h3>
                                <p className="text-sm text-text-secondary">{seq.steps.length} steps</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleEdit(seq)} className="p-1 text-secondary hover:text-primary"><Icon name="edit" /></button>
                                <button onClick={() => handleDeleteRequest(seq)} className="p-1 text-secondary hover:text-danger"><Icon name="trash" /></button>
                            </div>
                        </div>
                    ))}
                     {sequences?.length === 0 && (
                        <div className="text-center py-10">
                            <Icon name="mail" className="mx-auto w-12 h-12 text-text-secondary" />
                            <h3 className="mt-2 text-lg font-medium text-text-default">No sequences yet</h3>
                            <p className="mt-1 text-sm text-text-secondary">Create your first automated email sequence to get started.</p>
                        </div>
                    )}
                </div>
            </Card>

            {isEditorOpen && (
                <SequenceEditorModal
                    isOpen={isEditorOpen}
                    onClose={() => setIsEditorOpen(false)}
                    sequence={selectedSequence}
                />
            )}

            {isDeleteOpen && selectedSequence && (
                <ConfirmationModal
                    isOpen={isDeleteOpen}
                    onClose={() => setIsDeleteOpen(false)}
                    onConfirm={handleDeleteConfirm}
                    title="Delete Sequence"
                    message={`Are you sure you want to delete the "${selectedSequence.name}" sequence? This cannot be undone.`}
                    isDestructive
                />
            )}
        </>
    );
};

export default SequencesPage;
