import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { Task, User } from '../../types';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { Link, useParams } from 'react-router-dom';
import Select from '../../components/ui/Select';

const TaskListItem: React.FC<{ task: Task }> = ({ task }) => {
    const { useUpdateTask } = useData();
    const updateTask = useUpdateTask();

    const handleToggle = () => {
        updateTask.mutate({ ...task, completed: !task.completed });
    };

    const isOverdue = !task.completed && new Date(task.dueDate) < new Date();

    return (
        <div className="flex items-center justify-between p-4 border-b border-border-default last:border-b-0 hover:bg-bg-default">
            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={handleToggle}
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary flex-shrink-0"
                />
                <div>
                    <p className={`font-medium ${task.completed ? 'line-through text-text-secondary' : 'text-text-default'}`}>
                        {task.title}
                    </p>
                    {/* FIX: Corrected typo from toLocaleDateDateString to toLocaleDateString */}
                    <p className={`text-sm ${isOverdue ? 'text-danger' : 'text-text-secondary'}`}>
                        Due {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                </div>
            </div>
            {task.contactId && <Link to={`/contacts/${task.contactId}`} className="text-sm text-primary hover:underline">View Contact</Link>}
        </div>
    );
};


const TasksPage: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { currentUser } = useAuth();
  const { useTasks, useUsers } = useData();

  const targetUserId = userId || currentUser?.id;
  
  // Fetch the specific user if we are viewing someone else's tasks
  const { data: allUsers } = useUsers();
  const targetUser = useMemo(() => allUsers?.find(u => u.id === targetUserId), [allUsers, targetUserId]);

  const { data: tasks, isLoading, error } = useTasks({ assignedTo: targetUserId });

  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [sortBy, setSortBy] = useState<'dueDate' | 'title'>('dueDate');

  const filteredAndSortedTasks = useMemo(() => {
    if (!tasks) return [];
    
    const filtered = tasks.filter(task => {
        if (filter === 'all') return true;
        if (filter === 'pending') return !task.completed;
        if (filter === 'completed') return task.completed;
        return false;
    });

    return filtered.sort((a, b) => {
        if (sortBy === 'dueDate') {
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return a.title.localeCompare(b.title);
    });

  }, [tasks, filter, sortBy]);

  const pageTitle = userId ? `${targetUser?.name}'s Tasks` : 'My Tasks';

  if (isLoading) return <Spinner />;
  if (error) return <p className="text-danger">Error loading tasks.</p>;

  return (
    <Card title={pageTitle}>
        <div className="flex gap-4 mb-4 p-4 bg-bg-default rounded-lg border border-border-default -mt-6 -mx-6 mb-6">
            <Select value={filter} onChange={e => setFilter(e.target.value as any)} label="Filter by Status">
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="all">All</option>
            </Select>
            <Select value={sortBy} onChange={e => setSortBy(e.target.value as any)} label="Sort By">
                <option value="dueDate">Due Date</option>
                <option value="title">Title</option>
            </Select>
        </div>
        <div className="-mx-6 -mb-6">
            {filteredAndSortedTasks.length > 0 ? (
                filteredAndSortedTasks.map(task => <TaskListItem key={task.id} task={task} />)
            ) : (
                <p className="text-center text-text-secondary p-8">No tasks match your criteria.</p>
            )}
        </div>
    </Card>
  );
};

export default TasksPage;