import React from 'react';
import { useDrag } from 'react-dnd';
import { WorkflowNodeType, WorkflowTrigger, WorkflowAction, WorkflowConditionType } from '../../types';
import Icon from '../ui/Icon';

interface DraggableNodeProps {
    type: WorkflowNodeType;
    nodeType: WorkflowTrigger | WorkflowAction | WorkflowConditionType;
    label: string;
    icon: any;
    data: any;
}

const DraggableNode: React.FC<DraggableNodeProps> = ({ type, nodeType, label, icon, data }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'NODE',
        item: { type, nodeType, data },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    return (
        <div
            ref={drag}
            className={`p-3 border border-border-default rounded-lg bg-bg-card flex items-center gap-3 cursor-grab ${isDragging ? 'opacity-50' : ''}`}
        >
            <Icon name={icon} className="text-primary w-5 h-5" />
            <span className="text-sm font-medium">{label}</span>
        </div>
    );
};


const NodeSidebar: React.FC = () => {

    const triggers = [
        { type: WorkflowNodeType.Trigger, nodeType: WorkflowTrigger.NewContactCreated, label: 'New Contact Created', icon: 'plus', data: {} },
        { type: WorkflowNodeType.Trigger, nodeType: WorkflowTrigger.ContactStatusChanges, label: 'Contact Status Changes', icon: 'users', data: { newStatus: 'Active' } },
    ];
    
    const conditions = [
        { type: WorkflowNodeType.Condition, nodeType: WorkflowConditionType.ContactHasTag, label: 'Contact Has Tag', icon: 'tag', data: { tag: '' } },
        { type: WorkflowNodeType.Condition, nodeType: WorkflowConditionType.CheckLeadScore, label: 'Check Lead Score', icon: 'star', data: { score: 50, operator: '>=' } },
    ];

    const actions = [
        { type: WorkflowNodeType.Action, nodeType: WorkflowAction.CreateTask, label: 'Create a Task', icon: 'clipboard', data: { taskTitle: 'Default task title' } },
        { type: WorkflowNodeType.Action, nodeType: WorkflowAction.SendEmail, label: 'Send an Email', icon: 'mail', data: { templateId: '' } },
        { type: WorkflowNodeType.Action, nodeType: WorkflowAction.SendSMS, label: 'Send an SMS', icon: 'phone', data: { message: 'Hi {{contact.name}}!' } },
        { type: WorkflowNodeType.Action, nodeType: WorkflowAction.AssignContact, label: 'Assign Contact', icon: 'users', data: { assignedToId: '' } },
    ];


    return (
        <div className="w-64 bg-bg-card border border-border-default rounded-lg p-4 space-y-4">
            <div>
                <h3 className="font-semibold mb-2 text-text-default">Triggers</h3>
                <div className="space-y-2">
                    {triggers.map(item => <DraggableNode key={item.nodeType} {...item} />)}
                </div>
            </div>
             <div>
                <h3 className="font-semibold mb-2 text-text-default">Conditions</h3>
                <div className="space-y-2">
                    {conditions.map(item => <DraggableNode key={item.nodeType} {...item} />)}
                </div>
            </div>
             <div>
                <h3 className="font-semibold mb-2 text-text-default">Actions</h3>
                <div className="space-y-2">
                    {actions.map(item => <DraggableNode key={item.nodeType} {...item} />)}
                </div>
            </div>
        </div>
    );
};

export default NodeSidebar;