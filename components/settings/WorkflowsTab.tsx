import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { Workflow } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import Spinner from '../ui/Spinner';
import ConfirmationModal from '../ui/ConfirmationModal';

const WorkflowsTab: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { useWorkflows, useDeleteWorkflow } = useData();
    const { data: workflows, isLoading, error } = useWorkflows(currentUser?.organizationId);
    const deleteWorkflowMutation = useDeleteWorkflow();

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

    const handleAdd = () => {
        navigate('/settings/workflows/new');
    };

    const handleEdit = (workflow: Workflow) => {
        navigate(`/settings/workflows/${workflow.id}`);
    };

    const handleDeleteRequest = (workflow: Workflow) => {
        setSelectedWorkflow(workflow);
        setIsDeleteOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (selectedWorkflow) {
            deleteWorkflowMutation.mutate(selectedWorkflow.id, {
                onSuccess: () => {
                    setIsDeleteOpen(false);
                    setSelectedWorkflow(null);
                }
            });
        }
    };

    if (isLoading) return <Spinner />;
    if (error) return <p className="text-danger">Error loading workflows.</p>;

    return (
        <>
            <Card
                title="Workflow Automation"
                actions={<Button onClick={handleAdd}><Icon name="plus" /> New Workflow</Button>}
            >
                <div className="space-y-4">
                    {workflows?.map(wf => (
                        <div key={wf.id} className="p-4 border border-border-default rounded-lg flex justify-between items-center bg-bg-default">
                            <div>
                                <h3 className="font-semibold text-text-default">{wf.name}</h3>
                                {wf.trigger && wf.action ? (
                                    <p className="text-sm text-text-secondary">
                                        When <span className="font-mono text-primary">{wf.trigger}</span>, then <span className="font-mono text-primary">{wf.action}</span>.
                                    </p>
                                ) : (
                                    <p className="text-sm text-text-secondary">{wf.nodes.length} nodes, {wf.edges.length} edges.</p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleEdit(wf)} className="p-1 text-secondary hover:text-primary"><Icon name="edit" /></button>
                                <button onClick={() => handleDeleteRequest(wf)} className="p-1 text-secondary hover:text-danger"><Icon name="trash" /></button>
                            </div>
                        </div>
                    ))}
                     {workflows?.length === 0 && (
                        <div className="text-center py-10">
                            <Icon name="briefcase" className="mx-auto w-12 h-12 text-text-secondary" />
                            <h3 className="mt-2 text-lg font-medium text-text-default">No workflows yet</h3>
                            <p className="mt-1 text-sm text-text-secondary">Create your first workflow to automate tasks.</p>
                        </div>
                    )}
                </div>
            </Card>

            {isDeleteOpen && selectedWorkflow && (
                <ConfirmationModal
                    isOpen={isDeleteOpen}
                    onClose={() => setIsDeleteOpen(false)}
                    onConfirm={handleDeleteConfirm}
                    title="Delete Workflow"
                    message={`Are you sure you want to delete the "${selectedWorkflow.name}" workflow? This cannot be undone.`}
                    isDestructive
                    isLoading={deleteWorkflowMutation.isPending}
                />
            )}
        </>
    );
};

export default WorkflowsTab;