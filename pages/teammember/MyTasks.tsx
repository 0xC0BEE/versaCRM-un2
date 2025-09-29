
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { Task } from '../../types';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';

const MyTasks: React.FC = () => {
  const { currentUser } = useAuth();
  const { useTasks, useUpdateTask } = useData();
  const { data: tasks, isLoading } = useTasks({ assignedTo: currentUser?.id });
  const updateTaskMutation = useUpdateTask();

  const handleToggleComplete = (task: Task) => {
    updateTaskMutation.mutate({ ...task, completed: !task.completed });
  };
  
  const upcomingTasks = tasks?.filter(t => !t.completed).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) || [];
  const completedTasks = tasks?.filter(t => t.completed) || [];

  return (
    <Card title="My Tasks">
      {isLoading ? <Spinner /> : (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-2">Upcoming Tasks ({upcomingTasks.length})</h3>
                <div className="space-y-2">
                    {upcomingTasks.map(task => (
                        <div key={task.id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => handleToggleComplete(task)}
                                className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <div className="ml-3">
                                <p className="font-medium">{task.title}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                    {upcomingTasks.length === 0 && <p className="text-gray-500">No upcoming tasks. Great job!</p>}
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold mb-2">Completed Tasks ({completedTasks.length})</h3>
                <div className="space-y-2">
                    {completedTasks.map(task => (
                         <div key={task.id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg opacity-60">
                            <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => handleToggleComplete(task)}
                                className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <div className="ml-3">
                                <p className="font-medium line-through">{task.title}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}
    </Card>
  );
};

export default MyTasks;
