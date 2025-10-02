import React, { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { useNotification } from '../hooks/useNotification';
import StatCard from '../components/dashboard/StatCard';
import LeadConversionFunnel from '../components/dashboard/LeadConversionFunnel';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import DashboardWidget from '../components/dashboard/DashboardWidget';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { Link } from 'react-router-dom';
import { Task, DashboardWidget as DashboardWidgetType } from '../types';

const Dashboard: React.FC = () => {
    const { currentUser } = useAuth();
    const { useContacts, useLeads, useTasks, useDashboardWidgets, useDeleteDashboardWidget } = useData();
    const { addNotification } = useNotification();

    const { data: contacts, isLoading: contactsLoading } = useContacts(currentUser?.organizationId);
    const { data: leads, isLoading: leadsLoading } = useLeads(currentUser?.organizationId);
    const { data: tasks, isLoading: tasksLoading } = useTasks({ organizationId: currentUser?.organizationId });
    const { data: widgets, isLoading: widgetsLoading } = useDashboardWidgets(currentUser?.organizationId);
    const deleteWidgetMutation = useDeleteDashboardWidget();

    const [widgetToDelete, setWidgetToDelete] = useState<DashboardWidgetType | null>(null);

    const stats = useMemo(() => {
        if (!contacts || !leads || !tasks) return { newContacts: 0, wonDealsValue: 0, pendingTasks: 0 };
        
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const newContacts = contacts.filter(c => new Date(c.createdAt) > oneMonthAgo).length;
        const wonDealsValue = leads.filter(l => l.stage === 'Won').reduce((sum, l) => sum + l.value, 0);
        const pendingTasks = tasks.filter(t => !t.completed).length;

        return { newContacts, wonDealsValue, pendingTasks };
    }, [contacts, leads, tasks]);
    
    const recentTasks = useMemo(() => {
        if (!tasks) return [];
        return tasks
            .filter(t => !t.completed)
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .slice(0, 5);
    }, [tasks]);

    const handleDeleteRequest = (widget: DashboardWidgetType) => {
        setWidgetToDelete(widget);
    };

    const handleDeleteConfirm = () => {
        if (widgetToDelete) {
            deleteWidgetMutation.mutate(widgetToDelete.id, {
                onSuccess: () => {
                    addNotification(`Widget "${widgetToDelete.name}" was deleted.`, 'success');
                    setWidgetToDelete(null);
                },
                onError: (error) => {
                    addNotification(`Error deleting widget: ${error.message}`, 'error');
                    setWidgetToDelete(null);
                }
            });
        }
    };

    const isLoading = contactsLoading || leadsLoading || tasksLoading || widgetsLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Spinner />
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Welcome back, {currentUser?.name.split(' ')[0]}!</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Contacts" value={contacts?.length || 0} icon="users" />
                    <StatCard title="New Contacts (30d)" value={stats.newContacts} icon="plus" />
                    <StatCard title="Total Deals Value" value={`$${stats.wonDealsValue.toLocaleString()}`} icon="zap" />
                    <StatCard title="Pending Tasks" value={stats.pendingTasks} icon="clipboard" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <LeadConversionFunnel leads={leads || []} />
                    </div>
                    <div>
                        <Card 
                            title="My Upcoming Tasks"
                            actions={<Link to="/my-tasks" className="text-sm text-primary hover:underline">View All</Link>}
                        >
                            <div className="space-y-3">
                                {recentTasks.length > 0 ? recentTasks.map((task: Task) => (
                                    <div key={task.id} className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium text-sm">{task.title}</p>
                                            <p className="text-xs text-text-secondary">Due {new Date(task.dueDate).toLocaleDateString()}</p>
                                        </div>
                                        {task.contactId && <Link to={`/contacts/${task.contactId}`} className="text-xs text-primary hover:underline">View</Link>}
                                    </div>
                                )) : <p className="text-center text-sm text-text-secondary py-4">No pending tasks. Great job!</p>}
                            </div>
                        </Card>
                    </div>
                </div>

                {widgets && widgets.length > 0 ? (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">My Widgets</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {widgets.map(widget => (
                                <DashboardWidget key={widget.id} widget={widget} onDelete={() => handleDeleteRequest(widget)} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <Card>
                        <div className="text-center py-12">
                            <h3 className="text-lg font-medium text-text-default">Customize Your Dashboard</h3>
                            <p className="mt-1 text-sm text-text-secondary">Create and save custom reports to see them here.</p>
                            <Link to="/reports" className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-md text-sm font-semibold hover:opacity-90">
                                Go to Report Builder
                            </Link>
                        </div>
                    </Card>
                )}
            </div>

            {widgetToDelete && (
                <ConfirmationModal
                    isOpen={!!widgetToDelete}
                    onClose={() => setWidgetToDelete(null)}
                    onConfirm={handleDeleteConfirm}
                    title="Delete Widget"
                    message={`Are you sure you want to delete the "${widgetToDelete.name}" widget from your dashboard?`}
                    isDestructive
                    confirmText="Delete"
                    isLoading={deleteWidgetMutation.isPending}
                />
            )}
        </>
    );
};

export default Dashboard;