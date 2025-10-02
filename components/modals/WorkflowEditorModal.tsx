
// FIX: Create WorkflowEditorModal component to resolve module not found error.
import React, { useState, useEffect } from 'react';
import { Organization, Workflow, WorkflowTrigger, WorkflowAction, ContactStatus } from '../../types';
import { useData } from '../../hooks/useData';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

interface WorkflowEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization;
  workflow: Workflow | null;
}

const WorkflowEditorModal: React.FC<WorkflowEditorModalProps> = ({ isOpen, onClose, organization, workflow }) => {
  const { useAddWorkflow, useUpdateWorkflow } = useData();
  const addWorkflow = useAddWorkflow();
  const updateWorkflow = useUpdateWorkflow();

  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState<WorkflowTrigger>(WorkflowTrigger.NewContactCreated);
  const [action, setAction] = useState<WorkflowAction>(WorkflowAction.CreateTask);
  const [triggerCondition, setTriggerCondition] = useState<any>({});
  const [actionDetails, setActionDetails] = useState<any>({});

  useEffect(() => {
    if (workflow) {
      setName(workflow.name);
      setTrigger(workflow.trigger || WorkflowTrigger.NewContactCreated);
      setAction(workflow.action || WorkflowAction.CreateTask);
      setTriggerCondition(workflow.triggerCondition || {});
      setActionDetails(workflow.actionDetails || {});
    } else {
      setName('');
      setTrigger(WorkflowTrigger.NewContactCreated);
      setAction(WorkflowAction.CreateTask);
      setTriggerCondition({});
      setActionDetails({ taskTitle: 'New task from workflow' });
    }
  }, [workflow, isOpen]);

  const handleSubmit = () => {
    const data: Omit<Workflow, 'id'> = {
      name,
      organizationId: organization.id,
      trigger,
      action,
      triggerCondition,
      actionDetails,
      nodes: [], // for new workflow structure compatibility
      edges: [],
    };
    if (workflow) {
      updateWorkflow.mutate({ ...workflow, ...data }, { onSuccess: onClose });
    } else {
      addWorkflow.mutate(data, { onSuccess: onClose });
    }
  };

  const isLoading = addWorkflow.isPending || updateWorkflow.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={workflow ? 'Edit Workflow' : 'Create Workflow'}
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} isLoading={isLoading}>Save</Button>
      </>}
    >
      <div className="space-y-4">
        <Input label="Workflow Name" value={name} onChange={e => setName(e.target.value)} />
        <Select label="Trigger (When...)" value={trigger} onChange={e => setTrigger(e.target.value as WorkflowTrigger)}>
          {Object.values(WorkflowTrigger).map(t => <option key={t} value={t}>{t.replace(/([A-Z])/g, ' $1').trim()}</option>)}
        </Select>
        {trigger === WorkflowTrigger.ContactStatusChanges && (
            <Select label="...status changes to" value={triggerCondition.newStatus || ''} onChange={e => setTriggerCondition({ newStatus: e.target.value })}>
                {Object.values(ContactStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
        )}
        <Select label="Action (Then...)" value={action} onChange={e => setAction(e.target.value as WorkflowAction)}>
          {Object.values(WorkflowAction).map(a => <option key={a} value={a}>{a.replace(/([A-Z])/g, ' $1').trim()}</option>)}
        </Select>
        {action === WorkflowAction.CreateTask && (
            <Input label="...create task with title" value={actionDetails.taskTitle || ''} onChange={e => setActionDetails({ taskTitle: e.target.value })} />
        )}
      </div>
    </Modal>
  );
};

export default WorkflowEditorModal;