import React, { useState, useEffect } from 'react';
import { WorkflowNode, WorkflowAction, WorkflowTrigger, ContactStatus, User, WorkflowConditionType } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

interface NodeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (node: WorkflowNode) => void;
  node: WorkflowNode | null;
  teamMembers: User[];
}

const NodeConfigModal: React.FC<NodeConfigModalProps> = ({ isOpen, onClose, onSave, node, teamMembers }) => {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (node) {
      setFormData(node.data || {});
    }
  }, [node, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (node) {
      onSave({ ...node, data: formData });
      onClose();
    }
  };

  const renderConfigFields = () => {
    if (!node) return null;

    switch (node.nodeType) {
      case WorkflowTrigger.ContactStatusChanges:
        return (
          <Select
            label="Target Status"
            name="newStatus"
            value={formData.newStatus || ContactStatus.Active}
            onChange={handleChange}
          >
            {Object.values(ContactStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
        );
      case WorkflowConditionType.ContactHasTag:
        return (
            <Input
                label="Tag to check for"
                name="tag"
                value={formData.tag || ''}
                onChange={handleChange}
                placeholder="e.g., VIP"
                helperText="The condition will be 'Yes' if the contact has this tag."
            />
        );
      case WorkflowConditionType.CheckLeadScore:
          return (
              <div className="flex items-end gap-2">
                  <Select label="Operator" name="operator" value={formData.operator || '>='} onChange={handleChange} className="w-1/3">
                      <option value=">=">&gt;= (Greater or equal)</option>
                      <option value="<=">&lt;= (Less or equal)</option>
                  </Select>
                  <Input label="Score" name="score" type="number" value={formData.score || ''} onChange={handleChange} className="w-2/3"/>
              </div>
          );
      case WorkflowAction.CreateTask:
        return (
          <div className="space-y-4">
            <Input
              label="Task Title"
              name="taskTitle"
              value={formData.taskTitle || ''}
              onChange={handleChange}
              placeholder="e.g., Follow up with contact"
            />
            <Select
              label="Assign To"
              name="assignedToId"
              value={formData.assignedToId || ''}
              onChange={handleChange}
            >
              <option value="">Unassigned</option>
              {teamMembers.map(member => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </Select>
          </div>
        );
       case WorkflowAction.SendEmail:
        return (
           <Input
            label="Email Template ID"
            name="templateId"
            value={formData.templateId || ''}
            onChange={handleChange}
            placeholder="e.g., et-1"
            helperText="This feature is in development."
          />
        );
      case WorkflowAction.SendSMS:
        return (
            <div>
                <label htmlFor="sms-message" className="block text-sm font-medium text-text-secondary mb-1">
                    Message Content
                </label>
                <textarea
                    id="sms-message"
                    name="message"
                    rows={4}
                    value={formData.message || ''}
                    onChange={handleChange}
                    placeholder="Type your SMS message here..."
                    className="w-full p-2 border border-border-default rounded-lg bg-bg-card focus:ring-primary focus:outline-none"
                />
                <p className="text-xs text-text-secondary mt-1">
                    You can use personalization tags like {"{{contact.name}}"}
                </p>
            </div>
        );
        case WorkflowAction.AssignContact:
            return (
                 <Select
                    label="Assign Contact To"
                    name="assignedToId"
                    value={formData.assignedToId || ''}
                    onChange={handleChange}
                >
                    <option value="">Select a team member...</option>
                    {teamMembers.map(member => (
                        <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                </Select>
            );
      default:
        return <p className="text-text-secondary">This node has no configurable options.</p>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Configure ${node?.nodeType.replace(/([A-Z])/g, ' $1').trim()}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </>
      }
    >
      <div className="space-y-4">
        {renderConfigFields()}
      </div>
    </Modal>
  );
};

export default NodeConfigModal;