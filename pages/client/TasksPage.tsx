import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Icon from '../../components/ui/Icon';

const TasksPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { useTasks } = useData();
  const { data: allTasks, isLoading } = useTasks({ contactId: currentUser?.contactId });

  const sharedTasks = allTasks?.filter(task => task.sharedWithClient) || [];
  
  const pendingTasks = sharedTasks.filter(task => !task.completed);
  const completedTasks = sharedTasks.filter(task => task.completed);

  return (
    <Card title="My Tasks">
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-2 text-text-default">Pending Tasks ({pendingTasks.length})</h3>
                <div className="space-y-3">
                    {pendingTasks.length > 0 ? pendingTasks.map(task => (
                        <div key={task.id} className="p-4 bg-bg-default border border-border-default rounded-lg flex items-center justify-between">
                           <div>
                                <p className="font-medium text-text-default">{task.title}</p>
                                <p className="text-sm text-text-secondary">Due {new Date(task.dueDate).toLocaleDateString()}</p>
                           </div>
                           <Icon name="clipboard" className="text-primary"/>
                        </div>
                    )) : <p className="text-sm text-text-secondary">You have no pending tasks.</p>}
                </div>
            </div>
             <div>
                <h3 className="text-lg font-semibold mb-2 text-text-default">Completed Tasks ({completedTasks.length})</h3>
                <div className="space-y-3">
                     {completedTasks.length > 0 ? completedTasks.map(task => (
                        <div key={task.id} className="p-4 bg-bg-default border border-border-default rounded-lg flex items-center justify-between opacity-60">
                           <div>
                                <p className="font-medium text-text-default line-through">{task.title}</p>
                                <p className="text-sm text-text-secondary">Completed on {new Date(task.dueDate).toLocaleDateString()}</p>
                           </div>
                           <Icon name="clipboard" className="text-success"/>
                        </div>
                    )) : <p className="text-sm text-text-secondary">No tasks have been completed yet.</p>}
                </div>
            </div>

            {sharedTasks.length === 0 && (
                <p className="text-center text-text-secondary p-8">You have no shared tasks at this time.</p>
            )}
        </div>
      )}
    </Card>
  );
};

export default TasksPage;