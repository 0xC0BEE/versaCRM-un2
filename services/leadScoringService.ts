
import { Lead } from '../types';

/**
 * A mock service to score a lead based on its properties.
 * In a real application, this could use a more complex algorithm or a client-side ML model.
 */
export const leadScoringService = {
  /**
   * Scores a lead on a scale of 0-100.
   * This is a simple mock implementation that weighs source and value.
   */
  getScore: (lead: Lead): number => {
    let score = 10; // Base score

    // Score based on value
    if (lead.value > 100000) score += 30;
    else if (lead.value > 50000) score += 20;
    else if (lead.value > 10000) score += 10;

    // Score based on source
    const sourceWeights: Record<string, number> = {
        'Referral': 30,
        'Website': 20,
        'Cold Call': 5,
    };
    score += sourceWeights[lead.source] || 0;
    
    // Bonus for being qualified
    if (lead.stage === 'Qualified') {
        score += 20;
    } else if (lead.stage === 'Proposal') {
        score += 10;
    }


    return Math.min(Math.round(score), 99); // Cap at 99 for realism
  },
};
