import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { LeadScoringRule, LeadScoringAttribute } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import Spinner from '../ui/Spinner';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { useNotification } from '../../hooks/useNotification';

const LeadScoringTab: React.FC = () => {
    const { currentUser } = useAuth();
    const { useLeadScoringRules, useAddLeadScoringRule, useDeleteLeadScoringRule } = useData();
    const { addNotification } = useNotification();
    
    const { data: rules, isLoading } = useLeadScoringRules(currentUser?.organizationId);
    const addRuleMutation = useAddLeadScoringRule();
    const deleteRuleMutation = useDeleteLeadScoringRule();

    const [newRule, setNewRule] = useState<Partial<Omit<LeadScoringRule, 'id' | 'organizationId'>>>({
        attribute: LeadScoringAttribute.LeadSource,
        value: '',
        points: 10,
    });
    
    const handleAddRule = () => {
        if (!newRule.value || !newRule.points || !currentUser?.organizationId) {
            addNotification('Please complete all fields for the new rule.', 'error');
            return;
        }

        addRuleMutation.mutate({
            ...newRule,
            organizationId: currentUser.organizationId,
        } as Omit<LeadScoringRule, 'id'>, {
            onSuccess: () => {
                setNewRule({ attribute: LeadScoringAttribute.LeadSource, value: '', points: 10 });
            }
        });
    };

    if (isLoading) return <Spinner />;

    return (
        <Card title="Lead Scoring Rules">
            <div className="space-y-6">
                <p className="text-sm text-text-secondary">
                    Define rules to automatically score your contacts. The total score will be calculated and can be used in workflows for routing.
                </p>
                
                {/* Rule list */}
                <div className="space-y-2">
                    {rules?.map(rule => (
                        <div key={rule.id} className="flex items-center justify-between p-3 bg-bg-default border border-border-default rounded-md">
                            <div className="flex items-center gap-4 text-sm">
                                <span className="font-semibold text-text-default">IF</span>
                                <span className="font-mono bg-bg-card p-1 rounded text-xs">{rule.attribute === 'tag' ? 'Contact has tag' : 'Lead Source'}</span>
                                <span className="font-semibold text-text-default">IS</span>
                                <span className="font-mono bg-bg-card p-1 rounded text-xs">"{rule.value}"</span>
                                <span className="font-semibold text-text-default">THEN ADD</span>
                                <span className="font-mono bg-bg-card p-1 rounded text-xs">{rule.points} points</span>
                            </div>
                            <Button variant="secondary" className="!p-2" onClick={() => deleteRuleMutation.mutate(rule.id)}>
                                <Icon name="trash" />
                            </Button>
                        </div>
                    ))}
                     {rules?.length === 0 && <p className="text-center text-sm text-text-secondary py-4">No scoring rules defined yet.</p>}
                </div>
                
                {/* Add new rule form */}
                <div className="border-t border-border-default pt-4">
                     <h4 className="font-semibold mb-2">Add a New Rule</h4>
                     <div className="flex items-end gap-2">
                        <Select
                            label="Attribute"
                            value={newRule.attribute}
                            onChange={(e) => setNewRule(prev => ({ ...prev, attribute: e.target.value as LeadScoringAttribute }))}
                        >
                            <option value={LeadScoringAttribute.LeadSource}>Lead Source</option>
                            <option value={LeadScoringAttribute.Tag}>Has Tag</option>
                        </Select>
                         <Input
                            label="Value"
                            placeholder="e.g., Website or VIP"
                            value={newRule.value}
                            onChange={(e) => setNewRule(prev => ({...prev, value: e.target.value}))}
                         />
                         <Input
                            label="Points"
                            type="number"
                            value={newRule.points}
                            onChange={(e) => setNewRule(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                            className="w-24"
                         />
                         <Button onClick={handleAddRule} isLoading={addRuleMutation.isPending}>
                            <Icon name="plus" /> Add Rule
                         </Button>
                     </div>
                </div>
            </div>
        </Card>
    );
};

export default LeadScoringTab;