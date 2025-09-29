

import React, { useState } from 'react';
import { Organization, Workflow } from '../../../types';
import { useData } from '../../../hooks/useData';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/ui/Spinner';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import WorkflowEditorModal from '../../../components/modals/WorkflowEditorModal';
import { useOutletContext } from 'react-router-dom';

const WorkflowsTab: React.FC = () => {
  // FIX: Get organization data from parent route's context.
  const { organization } = useOutletContext<{ organization: Organization }>();
  const { useWorkflows, useDeleteWorkflow } = useData();
  const { data: workflows, isLoading, error } = useWorkflows(organization.id);
  const deleteWorkflow = useDeleteWorkflow();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  const handleAdd = () => {
    setSelectedWorkflow(null);
    setIsModalOpen(true);
  };
  
  const handleEdit = (workflow: Workflow) => {
      setSelectedWorkflow(workflow);
      setIsModalOpen(true);
  };

  const handleDelete = (workflowId: string) => {
      if(window.confirm('Are you sure you want to delete this workflow?')) {
          deleteWorkflow.mutate(workflowId);
      }
  };

  return (
    <>
    <Card title="Workflow Automation" actions={<Button onClick={handleAdd}><PlusIcon className="h-5 w-5 mr-2"/>Create Workflow</Button>}>
        {isLoading && <Spinner />}
        {error && <p className="text-red-500">Error loading workflows.</p>}
        {!isLoading && workflows && (
            <div className="space-y-4">
                {workflows.map(wf => (
                    <div key={wf.id} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
                        <div>
                            <p className="font-semibold">{wf.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                When <span className="font-mono text-primary-600">{wf.trigger}</span>, then <span className="font-mono text-primary-600">{wf.action}</span>
                            </p>
                        </div>
                        <div className="space-x-2">
                             <button onClick={() => handleEdit(wf)} className="text-primary-600 hover:text-primary-900"><PencilIcon className="h-5 w-5"/></button>
                             <button onClick={() => handleDelete(wf.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5"/></button>
                        </div>
                    </div>
                ))}
                {workflows.length === 0 && <p className="text-center text-gray-500 py-4">No workflows created yet.</p>}
            </div>
        )}
    </Card>
    {isModalOpen && (
        <WorkflowEditorModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            organization={organization}
            workflow={selectedWorkflow}
        />
    )}
    </>
  );
};

export default WorkflowsTab;
