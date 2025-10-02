import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDrop, DropTargetMonitor } from 'react-dnd';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import { Workflow, WorkflowNode as WorkflowNodeType, WorkflowEdge, WorkflowNodeType as NodeTypeEnum } from '../types';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import Input from '../components/ui/Input';
import NodeSidebar from '../components/workflows/NodeSidebar';
import WorkflowNode from '../components/workflows/WorkflowNode';
import NodeConfigModal from '../components/modals/NodeConfigModal';
import { useNotification } from '../hooks/useNotification';

// Helper function to calculate path for SVG edges
const getEdgePath = (sourceNode: WorkflowNodeType, targetNode: WorkflowNodeType, sourceHandle?: string) => {
    const sourceX = sourceNode.position.x + 240; // width of node
    let sourceY = sourceNode.position.y + 24; // middle of node
    
    if (sourceHandle === 'true') {
        sourceY = sourceNode.position.y + (48 * 0.25); // Top quarter
    } else if (sourceHandle === 'false') {
        sourceY = sourceNode.position.y + (48 * 0.75); // Bottom quarter
    }

    const targetX = targetNode.position.x;
    const targetY = targetNode.position.y + 24;
    
    return `M ${sourceX},${sourceY} C ${sourceX + 50},${sourceY} ${targetX - 50},${targetY} ${targetX},${targetY}`;
};

const WorkflowBuilderPage: React.FC = () => {
    const { workflowId } = useParams<{ workflowId: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { useWorkflows, useAddWorkflow, useUpdateWorkflow, useTeamMembers } = useData();
    const { addNotification } = useNotification();
    
    const { data: workflows, isLoading: workflowsLoading } = useWorkflows(currentUser?.organizationId);
    const { data: teamMembers } = useTeamMembers(currentUser?.organizationId);
    const addWorkflowMutation = useAddWorkflow();
    const updateWorkflowMutation = useUpdateWorkflow();

    const [workflow, setWorkflow] = useState<Partial<Workflow> | null>(null);
    const [nodes, setNodes] = useState<WorkflowNodeType[]>([]);
    const [edges, setEdges] = useState<WorkflowEdge[]>([]);
    const [workflowName, setWorkflowName] = useState('');
    
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [configuringNode, setConfiguringNode] = useState<WorkflowNodeType | null>(null);
    
    const [viewState, setViewState] = useState({ zoom: 1, pan: { x: 0, y: 0 } });
    const [isPanning, setIsPanning] = useState(false);
    const [startPanPoint, setStartPanPoint] = useState({ x: 0, y: 0 });
    
    const [draggingEdge, setDraggingEdge] = useState<{ sourceId: string, sourceHandle?: string, sourcePos: { x: number, y: number }, mousePos: { x: number, y: number } } | null>(null);

    const canvasRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (workflows) {
            if (workflowId === 'new') {
                const newWorkflow = {
                    name: 'New Workflow',
                    organizationId: currentUser!.organizationId,
                    nodes: [],
                    edges: [],
                };
                setWorkflow(newWorkflow);
                setWorkflowName(newWorkflow.name);
                setNodes(newWorkflow.nodes);
                setEdges(newWorkflow.edges);
            } else {
                const foundWorkflow = workflows.find(wf => wf.id === workflowId);
                if (foundWorkflow) {
                    setWorkflow(foundWorkflow);
                    setWorkflowName(foundWorkflow.name);
                    if (foundWorkflow.nodes.length === 0 && foundWorkflow.trigger && foundWorkflow.action) {
                        const triggerNode: WorkflowNodeType = { id: 'trigger-node', type: NodeTypeEnum.Trigger, nodeType: foundWorkflow.trigger, position: { x: 50, y: 150 }, data: foundWorkflow.triggerCondition || {} };
                        const actionNode: WorkflowNodeType = { id: 'action-node', type: NodeTypeEnum.Action, nodeType: foundWorkflow.action, position: { x: 350, y: 150 }, data: foundWorkflow.actionDetails || {} };
                        setNodes([triggerNode, actionNode]);
                        setEdges([{ id: 'edge-1', source: triggerNode.id, target: actionNode.id }]);
                    } else {
                        setNodes(foundWorkflow.nodes);
                        setEdges(foundWorkflow.edges);
                    }
                }
            }
        }
    }, [workflowId, workflows, currentUser]);
    
    const screenToCanvasCoords = useCallback((screenX: number, screenY: number) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0 };
        const x = (screenX - rect.left - viewState.pan.x) / viewState.zoom;
        const y = (screenY - rect.top - viewState.pan.y) / viewState.zoom;
        return { x, y };
    }, [viewState.zoom, viewState.pan]);

    const moveNode = useCallback((id: string, x: number, y: number) => {
        setNodes(prevNodes => prevNodes.map(node => (node.id === id ? { ...node, position: { x, y } } : node)));
    }, []);

    const [{ isOver }, drop] = useDrop(() => ({
        accept: ['NODE', 'WORKFLOW_NODE'],
        drop: (item: any, monitor: DropTargetMonitor) => {
            const clientOffset = monitor.getClientOffset();
            if (!clientOffset) return;
            const canvasCoords = screenToCanvasCoords(clientOffset.x, clientOffset.y);
            
            if (item.type && item.nodeType) { // Dropping new node from sidebar
                const newNode: WorkflowNodeType = {
                    id: `node-${Date.now()}`,
                    type: item.type,
                    nodeType: item.nodeType,
                    position: { x: canvasCoords.x, y: canvasCoords.y },
                    data: item.data || {},
                };
                setNodes(prev => [...prev, newNode]);
            } else { // Dragging existing node
                const delta = monitor.getDifferenceFromInitialOffset();
                const x = Math.round(item.x + delta.x / viewState.zoom);
                const y = Math.round(item.y + delta.y / viewState.zoom);
                moveNode(item.id, x, y);
            }
        },
        collect: monitor => ({ isOver: !!monitor.isOver() }),
    }), [moveNode, screenToCanvasCoords, viewState.zoom]);

    const handleSave = () => {
        const payload = { ...workflow, name: workflowName, nodes, edges, trigger: undefined, triggerCondition: undefined, action: undefined, actionDetails: undefined };
        if (workflowId === 'new') {
            addWorkflowMutation.mutate(payload as Omit<Workflow, 'id'>, { onSuccess: () => { addNotification('Workflow created!', 'success'); navigate('/settings'); } });
        } else {
            updateWorkflowMutation.mutate(payload as Workflow, { onSuccess: () => { addNotification('Workflow updated!', 'success'); navigate('/settings'); } });
        }
    };
    
    const handleConfigureNode = (node: WorkflowNodeType) => { setConfiguringNode(node); setIsConfigModalOpen(true); };
    const handleSaveNodeConfig = (updatedNode: WorkflowNodeType) => { setNodes(prev => prev.map(n => n.id === updatedNode.id ? updatedNode : n)); };

    // PANNING & ZOOMING LOGIC
    const handleZoom = (direction: 'in' | 'out' | 'reset') => {
        setViewState(prev => {
            let newZoom;
            if (direction === 'reset') newZoom = 1;
            else {
                const zoomFactor = 1.2;
                newZoom = direction === 'in' ? prev.zoom * zoomFactor : prev.zoom / zoomFactor;
            }
            return { ...prev, zoom: Math.max(0.2, Math.min(newZoom, 3)) };
        });
    };
    
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target !== canvasRef.current) return;
        setIsPanning(true);
        setStartPanPoint({ x: e.clientX - viewState.pan.x, y: e.clientY - viewState.pan.y });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isPanning) {
            const newPan = { x: e.clientX - startPanPoint.x, y: e.clientY - startPanPoint.y };
            setViewState(prev => ({ ...prev, pan: newPan }));
        }
        if (draggingEdge) {
            const canvasCoords = screenToCanvasCoords(e.clientX, e.clientY);
            setDraggingEdge(prev => prev ? { ...prev, mousePos: canvasCoords } : null);
        }
    };

    const handleMouseUp = () => { setIsPanning(false); setDraggingEdge(null); };

    // EDGE CONNECTION LOGIC
    const handleStartConnectorDrag = (nodeId: string, sourceHandle?: string) => {
        const sourceNode = nodes.find(n => n.id === nodeId);
        if (sourceNode) {
            let sourceY = sourceNode.position.y + 24;
            if (sourceHandle === 'true') sourceY = sourceNode.position.y + (48 * 0.25);
            if (sourceHandle === 'false') sourceY = sourceNode.position.y + (48 * 0.75);
            const sourcePos = { x: sourceNode.position.x + 240, y: sourceY };
            setDraggingEdge({ sourceId: nodeId, sourceHandle, sourcePos, mousePos: sourcePos });
        }
    };
    
    const handleDropOnConnector = (targetId: string, sourceId: string, sourceHandle?: string) => {
        if (sourceId === targetId || edges.some(e => e.source === sourceId && e.target === targetId && e.sourceHandle === sourceHandle)) return;
        const newEdge: WorkflowEdge = { id: `edge-${sourceId}-${sourceHandle || ''}-${targetId}`, source: sourceId, target: targetId, sourceHandle: sourceHandle as any };
        setEdges(prev => [...prev, newEdge]);
    };

    if (workflowsLoading) return <Spinner />;
    if (!workflow) return <div>Workflow not found.</div>;

    return (
        <>
            <div className="flex flex-col h-full overflow-hidden">
                <header className="p-4 border-b border-border-default flex justify-between items-center bg-bg-card flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <Button variant="secondary" onClick={() => navigate('/settings')}><Icon name="close"/></Button>
                        <Input value={workflowName} onChange={(e) => setWorkflowName(e.target.value)} className="text-lg font-semibold !py-1"/>
                    </div>
                    <Button onClick={handleSave} isLoading={addWorkflowMutation.isPending || updateWorkflowMutation.isPending}>Save Workflow</Button>
                </header>
                <div className="flex-grow flex">
                    <NodeSidebar />
                    <div ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} className="workflow-canvas flex-grow relative bg-bg-default overflow-hidden cursor-grab active:cursor-grabbing">
                        <div ref={drop} className="w-full h-full" style={{ transformOrigin: '0 0', transform: `translate(${viewState.pan.x}px, ${viewState.pan.y}px) scale(${viewState.zoom})` }}>
                           <svg className="absolute w-full h-full pointer-events-none">
                                {edges.map(edge => {
                                    const sourceNode = nodes.find(n => n.id === edge.source);
                                    const targetNode = nodes.find(n => n.id === edge.target);
                                    if (!sourceNode || !targetNode) return null;
                                    return <path key={edge.id} d={getEdgePath(sourceNode, targetNode, edge.sourceHandle || undefined)} stroke="var(--border-default)" strokeWidth="2" fill="none" />;
                                })}
                                {draggingEdge && <path d={`M ${draggingEdge.sourcePos.x},${draggingEdge.sourcePos.y} L ${draggingEdge.mousePos.x},${draggingEdge.mousePos.y}`} stroke="var(--color-primary)" strokeWidth="2" fill="none" strokeDasharray="5,5" />}
                           </svg>
                            {nodes.map(node => (
                                <WorkflowNode 
                                    key={node.id} 
                                    node={node}
                                    teamMembers={teamMembers || []} 
                                    onNodeClick={handleConfigureNode}
                                    onStartConnectorDrag={handleStartConnectorDrag}
                                    onDropOnConnector={handleDropOnConnector}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="absolute bottom-4 right-4 flex flex-col gap-2 p-1 bg-bg-card border border-border-default rounded-lg">
                        <Button variant="secondary" className="!p-2" onClick={() => handleZoom('in')}><Icon name="plus" /></Button>
                        <Button variant="secondary" className="!p-2" onClick={() => handleZoom('out')}><Icon name="close" /></Button>
                        <Button variant="secondary" className="!p-2" onClick={() => handleZoom('reset')}><Icon name="search" /></Button>
                    </div>
                </div>
            </div>
            
            {isConfigModalOpen && <NodeConfigModal isOpen={isConfigModalOpen} onClose={() => setIsConfigModalOpen(false)} onSave={handleSaveNodeConfig} node={configuringNode} teamMembers={teamMembers || []} />}
        </>
    );
};

export default WorkflowBuilderPage;
