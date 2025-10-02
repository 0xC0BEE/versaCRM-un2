import React from 'react';
import { useDrop } from 'react-dnd';
import { Lead, LeadStage } from '../../types';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
  stage: LeadStage;
  leads: Lead[];
  onDropLead: (leadId: string, newStage: LeadStage) => void;
  onOpenInsights: (lead: Lead) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ stage, leads, onDropLead, onOpenInsights }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'LEAD',
        drop: (item: { id: string }) => onDropLead(item.id, stage),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const totalValue = leads.reduce((sum, lead) => sum + lead.value, 0);

    return (
        <div 
            ref={drop}
            className={`w-72 flex-shrink-0 bg-bg-default rounded-lg border ${isOver ? 'border-primary' : 'border-transparent'}`}
        >
            <div className="p-3 border-b border-border-default">
                <h3 className="font-semibold text-sm">{stage} ({leads.length})</h3>
                <p className="text-xs text-text-secondary">${totalValue.toLocaleString()}</p>
            </div>
            <div className="p-3 space-y-3 h-full bg-bg-default/50">
                {leads.map(lead => (
                    <KanbanCard key={lead.id} lead={lead} onOpenInsights={onOpenInsights} />
                ))}
                {leads.length === 0 && (
                    <div className="text-center text-xs text-text-secondary py-10">
                        Drag leads here
                    </div>
                )}
            </div>
        </div>
    );
};

export default KanbanColumn;