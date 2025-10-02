import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { Lead, LeadStage } from '../../types';
import ConvertLeadModal from '../modals/ConvertLeadModal';
import Button from '../ui/Button';
import Icon from '../ui/Icon';

interface KanbanCardProps {
  lead: Lead;
  onOpenInsights: (lead: Lead) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ lead, onOpenInsights }) => {
    const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
    
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'LEAD',
        item: { id: lead.id },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    return (
        <>
            <div
                ref={drag}
                className={`p-3 bg-bg-card rounded-md shadow-sm border border-border-default cursor-grab ${isDragging ? 'opacity-50' : 'opacity-100'}`}
            >
                <div className="flex justify-between items-start">
                    <p className="font-semibold text-sm text-text-default">{lead.name}</p>
                    <button onClick={() => onOpenInsights(lead)} className="p-1 text-secondary hover:text-primary" aria-label="Get AI Insights">
                        <Icon name="sparkles" />
                    </button>
                </div>
                <p className="text-xs text-text-secondary mt-1">{lead.source}</p>
                <p className="text-sm font-bold text-text-default mt-2">${lead.value.toLocaleString()}</p>
                
                {lead.stage === LeadStage.Proposal && (
                     <Button 
                        variant="primary" 
                        onClick={() => setIsConvertModalOpen(true)}
                        className="w-full mt-3 !py-1 text-xs"
                    >
                        Convert to Patient
                    </Button>
                )}
            </div>
            {isConvertModalOpen && (
                <ConvertLeadModal 
                    isOpen={isConvertModalOpen}
                    onClose={() => setIsConvertModalOpen(false)}
                    lead={lead}
                />
            )}
        </>
    );
};

export default KanbanCard;