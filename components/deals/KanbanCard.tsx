
import React from 'react';
import { useDrag } from 'react-dnd';
import { Lead } from '../../types';
import { useData } from '../../hooks/useData';
import { leadScoringService } from '../../services/leadScoringService';
import Icon from '../ui/Icon';
import Button from '../ui/Button';

interface KanbanCardProps {
  lead: Lead;
  onConvertClick: (lead: Lead) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ lead, onConvertClick }) => {
  const { useTeamMembers } = useData();
  const { data: teamMembers } = useTeamMembers(lead.organizationId);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'lead',
    item: { id: lead.id },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  
  const assignedUser = teamMembers?.find(tm => tm.id === lead.assignedToId);
  const score = leadScoringService.getScore(lead);
  const scoreColor = score > 75 ? 'text-success' : score > 50 ? 'text-yellow-500' : 'text-danger';

  return (
    <div
      ref={drag}
      className={`bg-bg-card p-4 rounded-lg shadow-sm border border-border-default cursor-grab ${isDragging ? 'opacity-50' : ''}`}
    >
        <div className="flex justify-between items-start">
            <p className="font-semibold text-text-default">{lead.name}</p>
            <div className={`flex items-center font-bold text-lg ${scoreColor}`}>
                {score}
            </div>
        </div>
      <p className="text-sm text-text-secondary mt-1">{lead.email}</p>
      <div className="flex justify-between items-end mt-4">
        <div>
            <p className="text-lg font-bold text-primary">${lead.value.toLocaleString()}</p>
            {assignedUser && <p className="text-xs text-text-secondary">Owner: {assignedUser.name}</p>}
        </div>
        {lead.stage === 'Qualified' && (
            <Button onClick={() => onConvertClick(lead)} className="!px-2 !py-1 text-xs">
                Convert
            </Button>
        )}
      </div>
    </div>
  );
};

export default KanbanCard;
