import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/ui/Spinner';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import { LeadStage, Metric, Dimension, ChartType } from '../types';
import SaveWidgetModal from '../components/modals/SaveWidgetModal';
import { useNotification } from '../hooks/useNotification';

const COLORS = ['#48BB78', '#F56565', '#A0AEC0', '#00D4AA', '#718096', '#ED8936'];

const ReportsPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { useLeads, useTeamMembers, useContacts, useTickets, useAddDashboardWidget } = useData();
    const { addNotification } = useNotification();

    const [metric, setMetric] = useState<Metric>('newContacts');
    const [dimension, setDimension] = useState<Dimension>('byTeamMember');
    const [chartType, setChartType] = useState<ChartType>('bar');
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

    const { data: leads, isLoading: leadsLoading } = useLeads(currentUser?.organizationId);
    const { data: teamMembers, isLoading: teamLoading } = useTeamMembers(currentUser?.organizationId);
    const { data: contacts, isLoading: contactsLoading } = useContacts(currentUser?.organizationId);
    const { data: tickets, isLoading: ticketsLoading } = useTickets({ organizationId: currentUser?.organizationId });
    const addDashboardWidget = useAddDashboardWidget();

    const reportData = useMemo(() => {
        if (!leads || !contacts || !teamMembers || !tickets) return [];

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
        } else if (metric === 'slaAchievement') {
            let met = 0, breached = 0, pending = 0;
            tickets.forEach(ticket => {
                if (!ticket.slaDueAt) {
                    pending++;
                    return;
                }
                if (ticket.firstRespondedAt) {
                    if (new Date(ticket.firstRespondedAt) <= new Date(ticket.slaDueAt)) {
                        met++;
                    } else {
                        breached++;
                    }
                } else {
                    if (new Date() > new Date(ticket.slaDueAt)) {
                        breached++;
                    } else {
                        pending++;
                    }
                }
            });
            dataMap.set('Met', met);
            dataMap.set('Breached', breached);
            dataMap.set('Pending', pending);
        }

        return Array.from(dataMap.entries()).map(([name, value]) => ({ name, value }));

    }, [metric, dimension, leads, contacts, teamMembers, tickets]);

    const handleSaveWidget = (widgetName: string) => {
        if (!currentUser?.organizationId) return;

        addDashboardWidget.mutate({
            name: widgetName,
            organizationId: currentUser.organizationId,
            metric,
            dimension,
            chartType
        }, {
            onSuccess: () => {
                addNotification(`Widget "${widgetName}" saved to dashboard!`, 'success');
                setIsSaveModalOpen(false);
            },
            onError: () => {
                addNotification('Failed to save widget.', 'error');
            }
        });
    };

    const metricOptions: { value: Metric, label: string, dimensions: Dimension[], chartTypes: ChartType[] }[] = [
        { value: 'newContacts', label: 'New Contacts', dimensions: ['byTeamMember', 'byLeadSource'], chartTypes: ['bar', 'line', 'pie'] },
        { value: 'wonDealsValue', label: 'Won Deals Value', dimensions: ['byLeadSource', 'byTeamMember'], chartTypes: ['bar', 'line', 'pie'] },
        { value: 'leadCount', label: 'Lead Count', dimensions: ['byStage', 'byLeadSource'], chartTypes: ['bar', 'pie'] },
        { value: 'slaAchievement', label: 'SLA Achievement', dimensions: [], chartTypes: ['pie'] },
    ];

    const dimensionOptions: { value: Dimension, label: string }[] = [
        { value: 'byTeamMember', label: 'by Team Member' },
        { value: 'byLeadSource', label: 'by Lead Source' },
        { value: 'byStage', label: 'by Stage' },
    ];
    
    const currentMetricConfig = metricOptions.find(m => m.value === metric);
    const availableDimensions = currentMetricConfig?.dimensions || [];
    const availableChartTypes = currentMetricConfig?.chartTypes || ['bar', 'line', 'pie'];
    
    // Reset dimension and chart type if they are not available for the selected metric
    React.useEffect(() => {
        if (availableDimensions.length > 0 && !availableDimensions.includes(dimension)) {
            setDimension(availableDimensions[0]);
        }
        if (!availableChartTypes.includes(chartType)) {
            setChartType(availableChartTypes[0]);
        }
    }, [metric, availableDimensions, availableChartTypes, dimension, chartType]);

    const chartTitle = currentMetricConfig?.dimensions.length === 0 
        ? currentMetricConfig.label 
        : `${currentMetricConfig?.label} ${dimensionOptions.find(d => d.value === dimension)?.label}`;

    const renderChart = () => {
        if (reportData.length === 0) {
            return <div className="text-center p-12 text-text-secondary">No data to display.</div>;
        }
        switch (chartType) {
            case 'pie':
                return (
                    <PieChart>
                        <Pie data={reportData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                            {reportData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }} />
                        <Legend />
                    </PieChart>
                );
            case 'line':
                return (
                    <LineChart data={reportData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                        <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
                        <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }} />
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
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }} />
                        <Legend />
                        <Bar dataKey="value" fill="var(--color-primary)" />
                    </BarChart>
                );
        }
    };

    const isLoading = leadsLoading || teamLoading || contactsLoading || ticketsLoading;

    if (isLoading) return <Spinner />;

    return (
        <>
            <div className="space-y-6">
                <Card title="Report Builder">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 border-b border-border-default mb-4">
                        <Select label="Metric" value={metric} onChange={e => setMetric(e.target.value as Metric)}>
                            {metricOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </Select>
                        
                        {availableDimensions.length > 0 ? (
                            <Select label="Dimension" value={dimension} onChange={e => setDimension(e.target.value as Dimension)}>
                                {dimensionOptions
                                    .filter(opt => availableDimensions.includes(opt.value))
                                    .map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </Select>
                        ) : <div />}

                        <Select label="Chart Type" value={chartType} onChange={e => setChartType(e.target.value as ChartType)}>
                            {availableChartTypes.map(type => <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>)}
                        </Select>
                        
                        <Button onClick={() => setIsSaveModalOpen(true)}>
                            <Icon name="plus" /> Save as Widget
                        </Button>
                    </div>

                    <h2 className="text-xl font-semibold mb-4 text-center">{chartTitle}</h2>
                    <ResponsiveContainer width="100%" height={400}>
                        {renderChart()}
                    </ResponsiveContainer>
                </Card>
            </div>
            
            <SaveWidgetModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onSave={handleSaveWidget}
                isLoading={addDashboardWidget.isPending}
            />
        </>
    );
};

export default ReportsPage;
