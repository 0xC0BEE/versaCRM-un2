

import React from 'react';
import { Organization } from '../../../types';
import StatCard from '../../../components/dashboard/StatCard';
import { UsersIcon, ClipboardDocumentListIcon, CurrencyDollarIcon, BoltIcon } from '@heroicons/react/24/outline';
import { useData } from '../../../hooks/useData';
import Card from '../../../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Spinner from '../../../components/ui/Spinner';
import { useOutletContext } from 'react-router-dom';

const OrgDashboardTab: React.FC = () => {
    // FIX: Get organization data from parent route's context.
    const { organization } = useOutletContext<{ organization: Organization }>();
    const { useContacts, useTasks } = useData();
    const { data: contacts, isLoading: contactsLoading } = useContacts(organization.id);
    const { data: tasks, isLoading: tasksLoading } = useTasks({ organizationId: organization.id });

    const chartData = [
        { name: 'Jan', new: 4, active: 24 },
        { name: 'Feb', new: 3, active: 23 },
        { name: 'Mar', new: 5, active: 25 },
        { name: 'Apr', new: 8, active: 30 },
        { name: 'May', new: 6, active: 32 },
        { name: 'Jun', new: 11, active: 40 },
    ];

    if (contactsLoading || tasksLoading) return <Spinner />;

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Active Contacts" value={contacts?.length || 0} icon="users" />
            <StatCard title="Pending Tasks" value={tasks?.filter(t => !t.completed).length || 0} icon="clipboard" />
            <StatCard title="MRR (Est.)" value="$42,500" icon="chart" />
            <StatCard title="Avg. Response Time" value="2.1h" icon="zap" />
        </div>
        
        <Card title="Contact Growth">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="new" stackId="a" fill="#8884d8" name="New Contacts"/>
                    <Bar dataKey="active" stackId="a" fill="#82ca9d" name="Total Active"/>
                </BarChart>
            </ResponsiveContainer>
        </Card>
    </div>
  );
};

export default OrgDashboardTab;