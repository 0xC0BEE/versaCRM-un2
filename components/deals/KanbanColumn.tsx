
import React from 'react';
import { useDrop } from 'react-dnd';
import { Lead } from '../../types';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
  stage: Lead['stage'];
  leads: Lead[];
  onDrop: (leadId: string, newStage: Lead['stage']) => void;
  onConvertClick: (lead: Lead) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ stage, leads, onDrop, onConvertClick }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'lead',
        drop: (item: { id: string }) => onDrop(item.id, stage),
        collect: monitor => ({
            isOver: !!monitor.isOver(),
        }),
    }), [stage]);

    const totalValue = leads.reduce((sum, lead) => sum + lead.value, 0);

    return (
        <div
            ref={drop}
            className={`w-72 flex-shrink-0 bg-bg-default rounded-lg p-3 border ${isOver ? 'border-primary' : 'border-transparent'}`}
        >
            <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="font-semibold text-text-default">{stage} ({leads.length})</h3>
                <span className="text-sm text-text-secondary">${totalValue.toLocaleString()}</span>
            </div>
            <div className="space-y-3 h-full overflow-y-auto">
                {leads.map(lead => (
                    <KanbanCard key={lead.id} lead={lead} onConvertClick={onConvertClick} />
                ))}
            </div>
        </div>
    );
};

export default KanbanColumn;
