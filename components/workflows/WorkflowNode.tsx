import React, { memo } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { WorkflowNode as WorkflowNodeType, WorkflowTrigger, WorkflowAction, IconName, User, WorkflowNodeType as NodeTypeEnum, WorkflowConditionType } from '../../types';
import Icon from '../ui/Icon';

interface WorkflowNodeProps {
  node: WorkflowNodeType;
  teamMembers: User[];
  onNodeClick: (node: WorkflowNodeType) => void;
  onStartConnectorDrag: (nodeId: string, sourceHandle?: string) => void;
  onDropOnConnector: (targetId: string, sourceId: string, sourceHandle?: string) => void;
}

const nodeStyles: React.CSSProperties = {
  position: 'absolute',
  cursor: 'grab',
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid var(--border-default)',
  backgroundColor: 'var(--bg-card)',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  width: '240px',
};

const ConnectorHandle: React.FC<{ type: 'source' | 'target', nodeId: string, handleId?: string, position: React.CSSProperties, onStartDrag: (nodeId: string, handleId?: string) => void, onDrop: (sourceId: string, targetId: string, sourceHandle?: string) => void }> = ({ type, nodeId, handleId, position, onStartDrag, onDrop }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'CONNECTOR',
        item: () => {
            onStartDrag(nodeId, handleId);
            return { sourceId: nodeId, sourceHandle: handleId };
        },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }), [nodeId, handleId, onStartDrag]);

    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'CONNECTOR',
        drop: (item: { sourceId: string, sourceHandle?: string }) => {
            onDrop(item.sourceId, nodeId, item.sourceHandle);
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }), [nodeId, onDrop]);

    const handleRef = type === 'source' ? drag : drop;

    return (
        <div 
            ref={handleRef}
            style={{
                position: 'absolute',
                width: '24px',
                height: '24px',
                cursor: 'crosshair',
                zIndex: 10,
                ...position
            }}
            className="group"
        >
             <div className={`
                w-3 h-3 bg-bg-card border-2 border-primary rounded-full
                absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                transition-all group-hover:scale-125
                ${isOver ? 'bg-primary' : ''}
             `}/>
        </div>
    );
};

const getNodeInfo = (node: WorkflowNodeType, teamMembers: User[]): { label: string, icon: IconName, detail?: string } => {
    switch (node.nodeType) {
        case WorkflowTrigger.NewContactCreated:
            return { label: 'New Contact Created', icon: 'plus' };
        case WorkflowTrigger.ContactStatusChanges:
            return { label: 'Status Changes To', icon: 'users', detail: node.data?.newStatus || '...' };
        case WorkflowConditionType.ContactHasTag:
            return { label: 'Check Contact Tag', icon: 'tag', detail: `Tag is "${node.data?.tag || '...'}"` };
        case WorkflowConditionType.CheckLeadScore:
            return { label: 'Check Lead Score', icon: 'star', detail: `Score ${node.data?.operator || '>='} ${node.data?.score || '...'}` };
        case WorkflowAction.CreateTask:
            const taskAssignee = teamMembers.find(tm => tm.id === node.data?.assignedToId)?.name;
            return { label: 'Create a Task', icon: 'clipboard', detail: `${node.data?.taskTitle || '...'} ${taskAssignee ? `/ ${taskAssignee}`: ''}` };
        case WorkflowAction.SendEmail:
            return { label: 'Send an Email', icon: 'mail', detail: 'Template...' };
        case WorkflowAction.SendSMS:
            return { label: 'Send an SMS', icon: 'phone', detail: node.data?.message || '...' };
        case WorkflowAction.AssignContact:
            const contactAssignee = teamMembers.find(tm => tm.id === node.data?.assignedToId)?.name;
            return { label: 'Assign Contact To', icon: 'users', detail: contactAssignee || '...' };
        default:
            return { label: 'Node', icon: 'zap' };
    }
}

const WorkflowNodeComponent: React.FC<WorkflowNodeProps> = ({ node, teamMembers, onNodeClick, onStartConnectorDrag, onDropOnConnector }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'WORKFLOW_NODE',
        item: { id: node.id, x: node.position.x, y: node.position.y },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }), [node.id, node.position.x, node.position.y]);
    
    const { label, icon, detail } = getNodeInfo(node, teamMembers);
    const isConditionNode = node.type === NodeTypeEnum.Condition;

    return (
        <div
            ref={drag}
            style={{ ...nodeStyles, left: node.position.x, top: node.position.y, opacity: isDragging ? 0.5 : 1 }}
            onDoubleClick={() => onNodeClick(node)}
        >
            {node.type !== NodeTypeEnum.Trigger && (
                <ConnectorHandle type="target" nodeId={node.id} onStartDrag={() => {}} onDrop={onDropOnConnector} position={{ top: '50%', left: '-12px', transform: 'translateY(-50%)' }}/>
            )}
            
            <Icon name={icon} className="text-primary w-5 h-5 flex-shrink-0" />
            <div className="flex-grow overflow-hidden">
                <p className="text-sm font-semibold text-text-default truncate">{label}</p>
                {detail && <p className="text-xs text-text-secondary truncate">{detail}</p>}
            </div>

            {node.type !== NodeTypeEnum.Action && (
                isConditionNode ? (
                    <>
                        <ConnectorHandle type="source" nodeId={node.id} handleId="true" onStartDrag={onStartConnectorDrag} onDrop={() => {}} position={{ top: '25%', right: '-12px', transform: 'translateY(-50%)' }}/>
                        <span className="absolute text-xs" style={{ top: '25%', right: '-32px', transform: 'translateY(-50%)' }}>Yes</span>
                        <ConnectorHandle type="source" nodeId={node.id} handleId="false" onStartDrag={onStartConnectorDrag} onDrop={() => {}} position={{ top: '75%', right: '-12px', transform: 'translateY(-50%)' }}/>
                        <span className="absolute text-xs" style={{ top: '75%', right: '-30px', transform: 'translateY(-50%)' }}>No</span>
                    </>
                ) : (
                    <ConnectorHandle type="source" nodeId={node.id} onStartDrag={onStartConnectorDrag} onDrop={() => {}} position={{ top: '50%', right: '-12px', transform: 'translateY(-50%)' }}/>
                )
            )}
            
        </div>
    );
};

const WorkflowNode = memo(WorkflowNodeComponent);
export default WorkflowNode;