
import React, { useMemo } from 'react';
// FIX: The LeadStage enum is now imported and used to define the stages array, which resolves a type error.
import { Lead, LeadStage } from '../../types';
import Card from '../ui/Card';

interface LeadConversionFunnelProps {
  leads: Lead[];
}

const LeadConversionFunnel: React.FC<LeadConversionFunnelProps> = ({ leads }) => {
  const funnelData = useMemo(() => {
    // FIX: The stages array now correctly uses the LeadStage enum, resolving a type error.
    const stages: LeadStage[] = [LeadStage.New, LeadStage.Contacted, LeadStage.Qualified, LeadStage.Proposal, LeadStage.Won];
    const counts = stages.map(stage => ({
      stage,
      count: leads.filter(lead => lead.stage === stage).length
    }));

    // For a funnel, each stage should include the counts of the subsequent stages.
    let cumulativeCount = 0;
    for (let i = counts.length - 1; i >= 0; i--) {
        cumulativeCount += counts[i].count;
        counts[i].count = cumulativeCount;
    }

    const maxCount = counts[0]?.count || 1;

    return counts.map((item, index) => ({
      ...item,
      width: (item.count / maxCount) * 100,
      color: `hsl(165, 100%, ${35 + index * 8}%)` // HSL calculation for shades of primary
    }));
  }, [leads]);

  return (
    <Card title="Lead Conversion Funnel">
      <div className="space-y-2 flex flex-col items-center">
        {funnelData.map(({ stage, count, width, color }) => (
          <div key={stage} className="w-full text-center">
            <div
              className="h-8 rounded-md mx-auto transition-all duration-500"
              style={{ width: `${width}%`, backgroundColor: color }}
            ></div>
            <div className="flex justify-between items-center px-2">
                 <p className="text-sm font-semibold text-text-default">{stage}</p>
                 <p className="text-sm text-text-secondary">{count}</p>
            </div>
          </div>
        ))}
        {leads.length === 0 && <p className="text-center text-text-secondary py-10">No lead data to display.</p>}
      </div>
    </Card>
  );
};

export default LeadConversionFunnel;
