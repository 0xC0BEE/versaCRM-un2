import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { Sequence, SequenceStep, SequenceStepType } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Icon from '../ui/Icon';

interface SequenceEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sequence: Sequence | null;
}

const SequenceEditorModal: React.FC<SequenceEditorModalProps> = ({ isOpen, onClose, sequence }) => {
    const { currentUser } = useAuth();
    const { useEmailTemplates, useAddSequence, useUpdateSequence } = useData();
    const { data: templates } = useEmailTemplates(currentUser?.organizationId);
    const addSequenceMutation = useAddSequence();
    const updateSequenceMutation = useUpdateSequence();

    const [name, setName] = useState('');
    const [steps, setSteps] = useState<Partial<SequenceStep>[]>([]);

    useEffect(() => {
        if (sequence) {
            setName(sequence.name);
            setSteps(sequence.steps);
        } else {
            setName('');
            setSteps([{ type: SequenceStepType.Email, emailTemplateId: '' }]);
        }
    }, [sequence, isOpen]);
    
    const handleStepChange = (index: number, field: keyof SequenceStep, value: any) => {
        const newSteps = [...steps];
        (newSteps[index] as any)[field] = value;

        // Reset other fields when type changes
        if (field === 'type') {
            if (value === SequenceStepType.Email) {
                delete newSteps[index].delayDays;
                newSteps[index].emailTemplateId = '';
            } else {
                delete newSteps[index].emailTemplateId;
                newSteps[index].delayDays = 1;
            }
        }

        setSteps(newSteps);
    };

    const addStep = () => {
        setSteps([...steps, { type: SequenceStepType.Wait, delayDays: 3 }]);
    };

    const removeStep = (index: number) => {
        setSteps(steps.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        const finalSteps = steps.map((step, index) => ({
            ...step,
            id: step.id || `step-${Date.now()}-${index}`
        })) as SequenceStep[];

        const sequenceData = {
            name,
            steps: finalSteps,
            organizationId: currentUser!.organizationId,
        };

        if (sequence) {
            updateSequenceMutation.mutate({ ...sequence, ...sequenceData }, { onSuccess: onClose });
        } else {
            addSequenceMutation.mutate(sequenceData, { onSuccess: onClose });
        }
    };

    const isLoading = addSequenceMutation.isPending || updateSequenceMutation.isPending;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={sequence ? 'Edit Sequence' : 'Create Sequence'}
            size="lg"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} isLoading={isLoading}>Save Sequence</Button>
                </>
            }
        >
            <div className="space-y-6">
                <Input label="Sequence Name" value={name} onChange={e => setName(e.target.value)} />
                <div>
                    <h4 className="font-medium mb-2">Steps</h4>
                    <div className="space-y-3">
                        {steps.map((step, index) => (
                            <div key={index} className="p-3 bg-bg-default rounded-lg flex items-center gap-3">
                                <div className="font-bold text-text-secondary">{index + 1}</div>
                                <Select
                                    value={step.type}
                                    onChange={e => handleStepChange(index, 'type', e.target.value as SequenceStepType)}
                                    className="w-40"
                                >
                                    <option value={SequenceStepType.Email}>Send Email</option>
                                    <option value={SequenceStepType.Wait}>Wait</option>
                                </Select>
                                {step.type === SequenceStepType.Email ? (
                                    <Select
                                        value={step.emailTemplateId || ''}
                                        onChange={e => handleStepChange(index, 'emailTemplateId', e.target.value)}
                                        className="flex-grow"
                                    >
                                        <option value="">Select a template...</option>
                                        {templates?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </Select>
                                ) : (
                                    <div className="flex items-center gap-2 flex-grow">
                                        <Input
                                            type="number"
                                            value={step.delayDays || 1}
                                            onChange={e => handleStepChange(index, 'delayDays', parseInt(e.target.value, 10) || 1)}
                                            className="w-20"
                                        />
                                        <span>days</span>
                                    </div>
                                )}
                                <button onClick={() => removeStep(index)} className="p-1 text-secondary hover:text-danger" disabled={steps.length <= 1}>
                                    <Icon name="trash"/>
                                </button>
                            </div>
                        ))}
                         <Button variant="secondary" onClick={addStep} className="w-full">
                            <Icon name="plus" className="mr-2"/> Add Step
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default SequenceEditorModal;
