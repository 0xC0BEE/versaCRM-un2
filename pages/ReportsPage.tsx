import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/ui/Spinner';
import { subMonths, startOfMonth, endOfMonth } from 'date-fns';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';

const COLORS = ['#00D4AA', '#718096', '#48BB78', '#F56565', '#A0AEC0'];

const ReportsPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { useLeads, useTeamMembers, useContacts } = useData();

    const [dateRange, setDateRange] = useState(6); // Last 6 months
    const [selectedMember, setSelectedMember] = useState('all');

    const { data: leads, isLoading: leadsLoading } = useLeads(currentUser?.organizationId);
    const { data: teamMembers, isLoading: teamLoading } = useTeamMembers(currentUser?.organizationId);
    const { data: contacts, isLoading: contactsLoading } = useContacts(currentUser?.organizationId);

    const filteredData = useMemo(() => {
        const endDate = new Date();
        const startDate = startOfMonth(subMonths(endDate, dateRange - 1));
        
        const filteredLeads = leads?.filter(lead => {
            const leadDate = new Date(lead.createdAt);
            const memberMatch = selectedMember === 'all' || lead.assignedToId === selectedMember;
            return leadDate >= startDate && leadDate <= endDate && memberMatch;
        }) || [];

        const filteredContacts = contacts?.filter(contact => {
            const contactDate = new Date(contact.createdAt);
            const memberMatch = selectedMember === 'all' || contact.assignedToId === selectedMember;
            return contactDate >= startDate && contactDate <= endDate && memberMatch;
        }) || [];

        return { leads: filteredLeads, contacts: filteredContacts };
    }, [leads, contacts, dateRange, selectedMember]);


    const revenueBySourceData = useMemo(() => {
        const sourceMap: { [key: string]: number } = {};
        filteredData.leads.forEach(lead => {
            if (lead.stage === 'Won') {
                sourceMap[lead.source] = (sourceMap[lead.source] || 0) + lead.value;
            }
        });
        return Object.entries(sourceMap).map(([name, value]) => ({ name, value }));
    }, [filteredData.leads]);
    
    const isLoading = leadsLoading || teamLoading || contactsLoading;

    if (isLoading) return <Spinner/>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-text-default">Reports</h1>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => console.log("Exporting CSV...", filteredData)}>Export CSV</Button>
                    <Button variant="secondary" onClick={() => console.log("Exporting PDF...", filteredData)}>Export PDF</Button>
                </div>
            </div>
             <Card>
                <div className="flex gap-4">
                    <Select label="Date Range" value={dateRange} onChange={e => setDateRange(parseInt(e.target.value))}>
                        <option value={1}>Last Month</option>
                        <option value={3}>Last 3 Months</option>
                        <option value={6}>Last 6 Months</option>
                        <option value={12}>Last 12 Months</option>
                    </Select>
                     <Select label="Team Member" value={selectedMember} onChange={e => setSelectedMember(e.target.value)}>
                        <option value="all">All Members</option>
                        {teamMembers?.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
                    </Select>
                </div>
            </Card>

             <Card title="Won Revenue by Source">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={revenueBySourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                             {revenueBySourceData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                             ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}/>
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
};

export default ReportsPage;