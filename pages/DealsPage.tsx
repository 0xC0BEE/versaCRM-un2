
import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
// FIX: Added LeadStage to imports and used it to define the leadStages array to fix the type error.
import { Lead, LeadStage } from '../types';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
// FIX: The KanbanColumn component is now correctly implemented, and this import resolves the module-not-found error.
import KanbanColumn from '../components/deals/KanbanColumn';
import AddLeadModal from '../components/modals/AddLeadModal';
import ConvertLeadModal from '../components/modals/ConvertLeadModal';

// FIX: The array now correctly uses the LeadStage enum, resolving a type error.
const leadStages: LeadStage[] = [LeadStage.New, LeadStage.Contacted, LeadStage.Qualified, LeadStage.Proposal, LeadStage.Won, LeadStage.Lost];

const DealsPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { useLeads, useUpdateLead } = useData();
    const { data: leads, isLoading, error } = useLeads(currentUser?.organizationId);
    const updateLeadMutation = useUpdateLead();
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    const leadsByStage = useMemo(() => {
        const grouped: Record<Lead['stage'], Lead[]> = {
            [LeadStage.New]: [], [LeadStage.Contacted]: [], [LeadStage.Qualified]: [], [LeadStage.Proposal]: [], [LeadStage.Won]: [], [LeadStage.Lost]: []
        };
        leads?.forEach(lead => {
            if (grouped[lead.stage]) {
                grouped[lead.stage].push(lead);
            }
        });
        return grouped;
    }, [leads]);

    const handleDragEnd = (leadId: string, newStage: Lead['stage']) => {
        const lead = leads?.find(l => l.id === leadId);
        if (lead && lead.stage !== newStage) {
            updateLeadMutation.mutate({ ...lead, stage: newStage });
        }
    };

    const handleOpenConvertModal = (lead: Lead) => {
        setSelectedLead(lead);
        setIsConvertModalOpen(true);
    };

    if (isLoading) return <Spinner />;
    if (error) return <p className="text-danger">Error loading deals.</p>;

    return (
        <>
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-text-default">Deals Pipeline</h1>
                <Button onClick={() => setIsAddModalOpen(true)}>
                    <Icon name="plus"/> Add Lead
                </Button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4">
                {leadStages.map(stage => (
                    <KanbanColumn
                        key={stage}
                        stage={stage}
                        leads={leadsByStage[stage]}
                        onDrop={handleDragEnd}
                        onConvertClick={handleOpenConvertModal}
                    />
                ))}
            </div>
        </div>
        
        {isAddModalOpen && (
            <AddLeadModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />
        )}
        {isConvertModalOpen && selectedLead && (
            <ConvertLeadModal
                isOpen={isConvertModalOpen}
                onClose={() => setIsConvertModalOpen(false)}
                lead={selectedLead}
            />
        )}
        </>
    );
};

export default DealsPage;
