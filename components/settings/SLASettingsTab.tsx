import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { TicketPriority, SLAPolicy } from '../../types';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';
import Input from '../ui/Input';
import Button from '../ui/Button';

const SLASettingsTab: React.FC = () => {
    const { currentUser } = useAuth();
    const { useSLAPolicies, useUpdateSLAPolicy } = useData();

    const { data: policies, isLoading } = useSLAPolicies(currentUser?.organizationId);
    const updatePolicyMutation = useUpdateSLAPolicy();

    const [localPolicies, setLocalPolicies] = useState<SLAPolicy[]>([]);

    useEffect(() => {
        if (policies) {
            setLocalPolicies(policies);
        }
    }, [policies]);

    const handleTimeChange = (priority: TicketPriority, hours: number) => {
        setLocalPolicies(prev =>
            prev.map(p => (p.priority === priority ? { ...p, responseTimeHours: hours } : p))
        );
    };

    const handleSave = (policy: SLAPolicy) => {
        updatePolicyMutation.mutate(policy);
    };
    
    const getPolicyForPriority = (priority: TicketPriority) => {
        return localPolicies.find(p => p.priority === priority);
    }

    if (isLoading) return <Spinner />;

    return (
        <Card title="SLA Policies">
            <div className="space-y-6">
                <p className="text-sm text-text-secondary">
                    Set the target for first response time based on ticket priority. This will be used to track team performance.
                </p>

                <div className="space-y-4">
                    {Object.values(TicketPriority).map(priority => {
                        const policy = getPolicyForPriority(priority);
                        if (!policy) return null;
                        
                        return (
                            <div key={priority} className="flex items-center justify-between p-4 bg-bg-default border border-border-default rounded-lg">
                                <div className="font-semibold">
                                    <span className="mr-2">First response time for</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                                        priority === TicketPriority.High ? 'bg-danger/10 text-danger' : 
                                        priority === TicketPriority.Medium ? 'bg-yellow-500/10 text-yellow-500' : 
                                        'bg-success/10 text-success'
                                    }`}>
                                        {priority}
                                    </span>
                                    <span className="ml-2">priority tickets</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        className="w-24"
                                        value={policy.responseTimeHours}
                                        onChange={(e) => handleTimeChange(priority, parseInt(e.target.value, 10))}
                                    />
                                    <span className="text-sm text-text-secondary">hours</span>
                                    <Button 
                                        variant="secondary"
                                        onClick={() => handleSave(policy)}
                                        isLoading={updatePolicyMutation.isPending && updatePolicyMutation.variables?.id === policy.id}
                                    >
                                        Save
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </Card>
    );
};

export default SLASettingsTab;