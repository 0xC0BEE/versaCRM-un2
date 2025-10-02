
import React, { useState, useEffect } from 'react';
import { Lead } from '../../types';
import { geminiService } from '../../services/geminiService';
import { useIndustryConfig } from '../../hooks/useIndustryConfig';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';
import Icon from '../ui/Icon';

interface LeadInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  allLeads: Lead[];
}

interface Insights {
    likelihoodToClose: number;
    reasoning: string;
    nextBestAction: string;
}

const ProgressCircle: React.FC<{ score: number }> = ({ score }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                    className="text-border-default"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="50"
                    cy="50"
                />
                <circle
                    className="text-primary"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="50"
                    cy="50"
                    transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-text-default">{score}%</span>
            </div>
        </div>
    );
};

const LeadInsightsModal: React.FC<LeadInsightsModalProps> = ({ isOpen, onClose, lead, allLeads }) => {
    const industryConfig = useIndustryConfig();
    const [insights, setInsights] = useState<Insights | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && lead && industryConfig) {
            const fetchInsights = async () => {
                setIsLoading(true);
                setError(null);
                setInsights(null);
                try {
                    const result = await geminiService.getLeadInsights(lead, allLeads, industryConfig.label as any);
                    setInsights(result);
                } catch (err) {
                    setError('Failed to fetch AI insights. Please try again.');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchInsights();
        }
    }, [isOpen, lead, allLeads, industryConfig]);
    
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`AI Insights for ${lead.name}`}
            size="md"
        >
            {isLoading && <Spinner />}
            {error && <p className="text-center text-danger">{error}</p>}
            {insights && (
                <div className="space-y-6 text-center">
                    <div className="flex flex-col items-center">
                        <p className="text-lg font-semibold text-text-secondary mb-2">Likelihood to Close</p>
                        <ProgressCircle score={insights.likelihoodToClose} />
                    </div>

                    <div className="text-left bg-bg-default p-4 rounded-lg border border-border-default">
                        <h3 className="font-semibold text-text-default flex items-center gap-2 mb-2">
                            <Icon name="clipboard" /> Reasoning
                        </h3>
                        <p className="text-text-secondary">{insights.reasoning}</p>
                    </div>

                    <div className="text-left bg-primary/10 p-4 rounded-lg border border-primary/20">
                         <h3 className="font-semibold text-primary flex items-center gap-2 mb-2">
                           <Icon name="zap" /> Next Best Action
                        </h3>
                        <p className="text-primary font-medium">{insights.nextBestAction}</p>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default LeadInsightsModal;
