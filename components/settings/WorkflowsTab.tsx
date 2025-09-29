
import React, { useState } from 'react';
import { Workflow } from '../../types';
import { useData } from '../../hooks/useData';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import Icon from '../ui/Icon';
import WorkflowEditorModal from '../modals/WorkflowEditorModal';
import { useAuth } from '../../hooks/useAuth';
import ConfirmationModal from '../ui/ConfirmationModal';

const WorkflowsTab: React.FC = () => {
  const { currentUser } = useAuth();
  const { useWorkflows, useDeleteWorkflow } = useData();
  const { data: workflows, isLoading, error } = useWorkflows(currentUser?.organizationId);
  const deleteWorkflow = useDeleteWorkflow();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  const handleAdd = () => {
    setSelectedWorkflow(null);
    setIsModalOpen(true);
  };
  
  const handleEdit = (workflow: Workflow) => {
      setSelectedWorkflow(workflow);
      setIsModalOpen(true);
  };

  const handleDeleteRequest = (workflow: Workflow) => {
      setSelectedWorkflow(workflow);
      setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
      if(selectedWorkflow) {
          deleteWorkflow.mutate(selectedWorkflow.id);
          setIsDeleteModalOpen(false);
      }
  };

  return (
    <>
    <Card title="Workflow Automation" actions={<Button onClick={handleAdd}><Icon name="plus" className="mr-2"/>Create Workflow</Button>}>
        {isLoading && <Spinner />}
        {error && <p className="text-danger">Error loading workflows.</p>}
        {!isLoading && workflows && (
            <div className="space-y-4">
                {workflows.map(wf => (
                    <div key={wf.id} className="p-4 rounded-lg bg-bg-default border border-border-default flex justify-between items-center">
                        <div>
                            <p className="font-semibold">{wf.name}</p>
                            <p className="text-sm text-text-secondary">
                                When <span className="font-mono text-primary">{wf.trigger}</span>, then <span className="font-mono text-primary">{wf.action}</span>
                            </p>
                        </div>
                        <div className="space-x-2">
                             <button onClick={() => handleEdit(wf)} className="p-1 text-secondary hover:text-primary"><Icon name="edit" /></button>
                             <button onClick={() => handleDeleteRequest(wf)} className="p-1 text-secondary hover:text-danger"><Icon name="trash" /></button>
                        </div>
                    </div>
                ))}
                {workflows.length === 0 && <p className="text-center text-text-secondary py-4">No workflows created yet. Automate your work!</p>}
            </div>
        )}
    </Card>
    {isModalOpen && (
        <WorkflowEditorModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            workflow={selectedWorkflow}
        />
    )}
    {isDeleteModalOpen && selectedWorkflow && (
        <ConfirmationModal 
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDeleteConfirm}
            title="Delete Workflow"
            message={`Are you sure you want to delete the "${selectedWorkflow.name}" workflow?`}
            isDestructive
            confirmText="Delete"
        />
    )}
    </>
  );
};

export default WorkflowsTab;
