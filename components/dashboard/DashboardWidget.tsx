import React, { useMemo } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';
import Icon from '../ui/Icon';
import { DashboardWidget as DashboardWidgetType, LeadStage } from '../../types';

const COLORS = ['#00D4AA', '#718096', '#48BB78', '#F56565', '#A0AEC0', '#ED8936'];

interface DashboardWidgetProps {
  widget: DashboardWidgetType;
  onDelete: () => void;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({ widget, onDelete }) => {
    const { currentUser } = useAuth();
    const { useLeads, useTeamMembers, useContacts } = useData();

    const { data: leads, isLoading: leadsLoading } = useLeads(currentUser?.organizationId);
    const { data: teamMembers, isLoading: teamLoading } = useTeamMembers(currentUser?.organizationId);
    const { data: contacts, isLoading: contactsLoading } = useContacts(currentUser?.organizationId);
    
    const { metric, dimension } = widget;

    const reportData = useMemo(() => {
        if (!leads || !contacts || !teamMembers) return [];

        const dataMap = new Map<string, number>();

        if (metric === 'newContacts') {
            if (dimension === 'byTeamMember') {
                teamMembers.forEach(tm => dataMap.set(tm.name, 0));
                contacts.forEach(contact => {
                    const assignee = teamMembers.find(tm => tm.id === contact.assignedToId);
                    const key = assignee ? assignee.name : 'Unassigned';
                    dataMap.set(key, (dataMap.get(key) || 0) + 1);
                });
            } else { // byLeadSource
                 contacts.forEach(contact => {
                    const key = contact.leadSource || 'Unknown';
                    dataMap.set(key, (dataMap.get(key) || 0) + 1);
                });
            }
        } else if (metric === 'wonDealsValue') {
            const wonLeads = leads.filter(l => l.stage === LeadStage.Won);
            if (dimension === 'byLeadSource') {
                 wonLeads.forEach(lead => {
                    const key = lead.source || 'Unknown';
                    dataMap.set(key, (dataMap.get(key) || 0) + lead.value);
                });
            } else { // byTeamMember
                teamMembers.forEach(tm => dataMap.set(tm.name, 0));
                wonLeads.forEach(lead => {
                    const assignee = teamMembers.find(tm => tm.id === lead.assignedToId);
                    const key = assignee ? assignee.name : 'Unassigned';
                    dataMap.set(key, (dataMap.get(key) || 0) + lead.value);
                });
            }
        } else if (metric === 'leadCount') {
            if (dimension === 'byStage') {
                Object.values(LeadStage).forEach(stage => dataMap.set(stage, 0));
                leads.forEach(lead => {
                    dataMap.set(lead.stage, (dataMap.get(lead.stage) || 0) + 1);
                });
            } else { // byLeadSource
                 leads.forEach(lead => {
                    const key = lead.source || 'Unknown';
                    dataMap.set(key, (dataMap.get(key) || 0) + 1);
                });
            }
        }
        return Array.from(dataMap.entries()).map(([name, value]) => ({ name, value }));
    }, [metric, dimension, leads, contacts, teamMembers]);
    
    const renderChart = () => {
        if (reportData.length === 0) {
            return <div className="text-center p-12 text-text-secondary">No data to display.</div>;
        }
        switch(widget.chartType) {
            case 'pie':
                return (
                    <PieChart>
                        <Pie data={reportData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                            {reportData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}/>
                        <Legend />
                    </PieChart>
                );
            case 'line':
                 return (
                    <LineChart data={reportData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                        <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
                        <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}/>
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2} />
                    </LineChart>
                );
            case 'bar':
            default:
                return (
                    <BarChart data={reportData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                        <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
                        <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}/>
                        <Legend />
                        <Bar dataKey="value" fill="var(--color-primary)" />
                    </BarChart>
                );
        }
    }
    
    const isLoading = leadsLoading || teamLoading || contactsLoading;

    return (
        <Card 
            title={widget.name}
            actions={
                <button onClick={onDelete} className="p-1 text-secondary hover:text-danger" aria-label="Delete widget">
                    <Icon name="trash" />
                </button>
            }
        >
            {isLoading ? <Spinner /> : (
                <ResponsiveContainer width="100%" height={300}>
                    {renderChart()}
                </ResponsiveContainer>
            )}
        </Card>
    );
};

export default DashboardWidget;