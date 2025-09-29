
import React, { useMemo } from 'react';
import StatCard from '../components/dashboard/StatCard';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Spinner from '../components/ui/Spinner';
import { UserRole } from '../types';
import { Navigate } from 'react-router-dom';
import LeadConversionFunnel from '../components/dashboard/LeadConversionFunnel';
import { eachMonthOfInterval, format, subMonths } from 'date-fns';

const Dashboard: React.FC = () => {
    const { currentUser } = useAuth();
    
    if (currentUser?.role === UserRole.SuperAdmin) return <Navigate to="/superadmin/dashboard" />;
    if (currentUser?.role === UserRole.TeamMember) return <Navigate to="/team-member" />;
    if (currentUser?.role === UserRole.Client) return <Navigate to="/client" />;
    
    const { useContacts, useTasks, useLeads } = useData();
    const { data: contacts, isLoading: contactsLoading } = useContacts(currentUser?.organizationId);
    const { data: tasks, isLoading: tasksLoading } = useTasks({ organizationId: currentUser?.organizationId });
    const { data: leads, isLoading: leadsLoading } = useLeads(currentUser?.organizationId);

    const contactGrowthData = useMemo(() => {
        if (!contacts) return [];
        const now = new Date();
        const sixMonthsAgo = subMonths(now, 5);
        const monthInterval = eachMonthOfInterval({ start: sixMonthsAgo, end: now });

        const data = monthInterval.map(monthStart => ({
            name: format(monthStart, 'MMM'),
            new: 0,
            total: 0,
        }));

        contacts.forEach(contact => {
            const monthStr = format(new Date(contact.createdAt), 'MMM');
            const monthData = data.find(d => d.name === monthStr);
            if (monthData) {
                monthData.new += 1;
            }
        });
        
        // Create cumulative totals
        for (let i = 0; i < data.length; i++) {
            const previousTotal = i > 0 ? data[i - 1].total : 0;
            const contactsUpToMonth = contacts.filter(c => new Date(c.createdAt) <= monthInterval[i]).length;
            data[i].total = contactsUpToMonth;
        }

        return data;
    }, [contacts]);


    const totalLeadsValue = leads?.reduce((sum, lead) => sum + lead.value, 0) || 0;

    const isLoading = contactsLoading || tasksLoading || leadsLoading;

    if (isLoading) return <Spinner />;

  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold text-text-default">Welcome back, {currentUser?.name.split(' ')[0]}!</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Active Patients" value={contacts?.length || 0} icon="users" change="+5.4%" />
            <StatCard title="New Leads" value={leads?.filter(l => l.stage === 'New').length || 0} icon="zap" change="-2.1%" isNegative />
            <StatCard title="Pipeline Value" value={`$${(totalLeadsValue / 1000).toFixed(1)}k`} icon="chart" change="+12%" />
            <StatCard title="Pending Tasks" value={tasks?.filter(t => !t.completed).length || 0} icon="clipboard" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card title="Patient Growth" className="lg:col-span-2">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={contactGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                        <XAxis dataKey="name" stroke="var(--text-secondary)" />
                        <YAxis stroke="var(--text-secondary)" />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}/>
                        <Legend />
                        <Bar dataKey="new" fill="var(--color-primary)" name="New Patients"/>
                        <Bar dataKey="total" fill="var(--color-secondary)" name="Total Patients"/>
                    </BarChart>
                </ResponsiveContainer>
            </Card>
            <LeadConversionFunnel leads={leads || []} />
        </div>
    </div>
  );
};

export default Dashboard;
