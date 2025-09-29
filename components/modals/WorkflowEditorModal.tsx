
import React, { useState, useEffect } from 'react';
import { Workflow, WorkflowTrigger, WorkflowAction, ContactStatus, Organization } from '../../types';
import { useData } from '../../hooks/useData';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { useAuth } from '../../hooks/useAuth';

interface WorkflowEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: Workflow | null;
  organization?: Organization;
}

const WorkflowEditorModal: React.FC<WorkflowEditorModalProps> = ({ isOpen, onClose, workflow, organization }) => {
  const { currentUser } = useAuth();
  const { useAddWorkflow, useUpdateWorkflow } = useData();
  const addWorkflow = useAddWorkflow();
  const updateWorkflow = useUpdateWorkflow();
  
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState<WorkflowTrigger>(WorkflowTrigger.ContactStatusChanges);
  const [triggerCondition, setTriggerCondition] = useState<{ newStatus: ContactStatus }>({ newStatus: ContactStatus.Active });
  const [action, setAction] = useState<WorkflowAction>(WorkflowAction.CreateTask);
  const [actionDetails, setActionDetails] = useState<any>({ taskTitle: '', assignTo: 'owner' });

  useEffect(() => {
    if (workflow) {
      setName(workflow.name);
      setTrigger(workflow.trigger);
      setTriggerCondition(workflow.triggerCondition || { newStatus: ContactStatus.Active });
      setAction(workflow.action);
      setActionDetails(workflow.actionDetails || {});
    } else {
      setName('');
      setTrigger(WorkflowTrigger.ContactStatusChanges);
      setTriggerCondition({ newStatus: ContactStatus.Active });
      setAction(WorkflowAction.CreateTask);
      setActionDetails({ taskTitle: 'Follow up with patient', assignTo: 'owner' });
    }
  }, [workflow, isOpen]);

  const handleSubmit = () => {
    const organizationId = organization?.id || currentUser?.organizationId;
    if (!organizationId) return;

    const data: Omit<Workflow, 'id'> = {
      name,
      organizationId: organizationId,
      trigger,
      triggerCondition,
      action,
      actionDetails
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
        <Button onClick={handleSubmit} isLoading={isLoading}>Save Workflow</Button>
      </>}
    >
      <div className="space-y-4">
        <Input label="Workflow Name" value={name} onChange={e => setName(e.target.value)} />

        <div className="p-4 border rounded-md border-border-default space-y-3">
          <h4 className="font-semibold">Trigger ("When this happens...")</h4>
          <Select label="Trigger Event" value={trigger} onChange={e => setTrigger(e.target.value as WorkflowTrigger)}>
            <option value={WorkflowTrigger.ContactStatusChanges}>Patient Status Changes</option>
            <option value={WorkflowTrigger.NewContactCreated}>A New Patient is Created</option>
          </Select>
          {trigger === WorkflowTrigger.ContactStatusChanges && (
            <Select label="To Status" value={triggerCondition.newStatus} onChange={e => setTriggerCondition({ newStatus: e.target.value as ContactStatus })}>
              {Object.values(ContactStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          )}
        </div>

        <div className="p-4 border rounded-md border-border-default space-y-3">
          <h4 className="font-semibold">Action ("Do this...")</h4>
          <Select label="Action" value={action} onChange={e => setAction(e.target.value as WorkflowAction)}>
            <option value={WorkflowAction.CreateTask}>Create a Task</option>
            <option value={WorkflowAction.SendEmail} disabled>Send an Email (coming soon)</option>
          </Select>
          {action === WorkflowAction.CreateTask && (
            <Input label="Task Title" value={actionDetails.taskTitle} onChange={e => setActionDetails({ ...actionDetails, taskTitle: e.target.value })} />
          )}
        </div>

      </div>
    </Modal>
  );
};

export default WorkflowEditorModal;
