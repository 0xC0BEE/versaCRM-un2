
import React, { useState } from 'react';
import { Contact, Task, User } from '../../types';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../ui/Spinner';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Icon from '../ui/Icon';
import { useAppContext } from '../../hooks/useAppContext';
import { useNotification } from '../../hooks/useNotification';

interface TasksTabProps {
  contact: Contact;
  teamMembers: User[];
}

const TasksTab: React.FC<TasksTabProps> = ({ contact, teamMembers }) => {
    const { currentUser } = useAuth();
    const { useTasks, useAddTask, useUpdateTask } = useData();
    const { integrations } = useAppContext();
    const { addNotification } = useNotification();
    
    const { data: tasks, isLoading } = useTasks({ contactId: contact.id });
    const addTaskMutation = useAddTask();
    const updateTaskMutation = useUpdateTask();

    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [assignedTo, setAssignedTo] = useState(currentUser?.id || '');

    const handleAddTask = () => {
        if (!newTaskTitle.trim()) return;
        addTaskMutation.mutate({
            title: newTaskTitle,
            contactId: contact.id,
            organizationId: contact.organizationId,
            assignedTo: assignedTo,
            completed: false,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        }, {
            onSuccess: () => setNewTaskTitle(''),
        });
    };

    const handleToggleComplete = (task: Task) => {
        updateTaskMutation.mutate({ ...task, completed: !task.completed });
    };

    const handleSendToSlack = (task: Task) => {
        // Mock sending to slack
        console.log(`Sending task '${task.title}' to Slack.`);
        addNotification(`Task "${task.title}" sent to Slack (mock).`, 'info');
    };

    const getAssigneeName = (id: string) => teamMembers.find(m => m.id === id)?.name || 'N/A';
    
    if (isLoading) return <Spinner />;

    return (
        <div className="space-y-6">
            <div className="bg-bg-default p-4 rounded-lg border border-border-default space-y-3">
                <h3 className="font-semibold">Add New Task</h3>
                <Input 
                    placeholder="Task title..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                />
                <div className="flex gap-2">
                    <Select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="flex-1">
                        {teamMembers.map(member => (
                            <option key={member.id} value={member.id}>{member.name}</option>
                        ))}
                    </Select>
                    <Button onClick={handleAddTask} isLoading={addTaskMutation.isPending}>
                        <Icon name="plus" /> Add Task
                    </Button>
                </div>
            </div>
            <div>
                {tasks?.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 border-b border-border-default">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => handleToggleComplete(task)}
                                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <div>
                                <p className={`font-medium ${task.completed ? 'line-through text-text-secondary' : 'text-text-default'}`}>
                                    {task.title}
                                </p>
                                <p className="text-sm text-text-secondary">
                                    Assigned to {getAssigneeName(task.assignedTo)} - Due {new Date(task.dueDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        {integrations.slack && (
                             // FIX: Confirmed that the invalid 'size' prop is not present.
                             <Button variant="secondary" onClick={() => handleSendToSlack(task)} className="!p-2">
                                <Icon name="zap" className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                ))}
                 {tasks?.length === 0 && <p className="text-center text-text-secondary py-4">No tasks for this contact yet.</p>}
            </div>
        </div>
    );
};

export default TasksTab;
