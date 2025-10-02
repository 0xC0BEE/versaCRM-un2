import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { Lead, LeadStage } from '../types';
import KanbanColumn from '../components/deals/KanbanColumn';
import AddLeadModal from '../components/modals/AddLeadModal';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import Spinner from '../components/ui/Spinner';
import LeadInsightsModal from '../components/modals/LeadInsightsModal';

const DealsPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { useLeads, useUpdateLead, useTeamMembers } = useData();
    const { data: leads, isLoading, error } = useLeads(currentUser?.organizationId);
    const { data: teamMembers } = useTeamMembers(currentUser?.organizationId);
    const updateLeadMutation = useUpdateLead();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
    const [insightsLead, setInsightsLead] = useState<Lead | null>(null);

    const handleDropLead = (leadId: string, newStage: LeadStage) => {
        const leadToMove = leads?.find(l => l.id === leadId);
        if (leadToMove && leadToMove.stage !== newStage) {
            updateLeadMutation.mutate({ ...leadToMove, stage: newStage });
        }
    };

    const columns = useMemo(() => {
        return Object.values(LeadStage).map(stage => ({
            stage,
            leads: leads?.filter(l => l.stage === stage) || []
        }));
    }, [leads]);

    const getAssigneeName = (id?: string) => {
        if (!id) return 'Unassigned';
        return teamMembers?.find(tm => tm.id === id)?.name || 'Unknown User';
    };


    if (isLoading) return <Spinner />;
    if (error) return <p className="text-danger">Error loading deals pipeline.</p>;

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold">Deals Pipeline</h1>
                    <div className="flex items-center bg-bg-default border border-border-default rounded-lg p-1">
                        <button 
                            onClick={() => setViewMode('kanban')}
                            className={`px-3 py-1 text-sm font-semibold rounded-md ${viewMode === 'kanban' ? 'bg-primary text-white' : 'text-text-secondary'}`}
                        >
                            Kanban View
                        </button>
                        <button 
                            onClick={() => setViewMode('table')}
                             className={`px-3 py-1 text-sm font-semibold rounded-md ${viewMode === 'table' ? 'bg-primary text-white' : 'text-text-secondary'}`}
                        >
                            Table View
                        </button>
                    </div>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)}>
                    <Icon name="plus" /> Add Lead
                </Button>
            </div>

            {viewMode === 'kanban' && (
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {columns.map(({ stage, leads }) => (
                        <KanbanColumn
                            key={stage}
                            stage={stage}
                            leads={leads}
                            onDropLead={handleDropLead}
                            onOpenInsights={setInsightsLead}
                        />
                    ))}
                </div>
            )}

            {viewMode === 'table' && (
                <div className="bg-bg-card border border-border-default rounded-lg shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-bg-default">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Lead Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Stage</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Value</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Assigned To</th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">AI Insights</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-default">
                                {leads?.map(lead => (
                                    <tr key={lead.id} className="hover:bg-bg-default">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{lead.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{lead.stage}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">${lead.value.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{getAssigneeName(lead.assignedToId)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <Button variant="secondary" className="!py-1 !px-2" onClick={() => setInsightsLead(lead)}>
                                                <Icon name="sparkles" className="w-4 h-4 mr-1" />
                                                Analyze
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {isAddModalOpen && (
                <AddLeadModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                />
            )}
            
            {insightsLead && (
                <LeadInsightsModal
                    isOpen={!!insightsLead}
                    onClose={() => setInsightsLead(null)}
                    lead={insightsLead}
                    allLeads={leads || []}
                />
            )}
        </>
    );
};

export default DealsPage;