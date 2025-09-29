
import React, { useState } from 'react';
import Card from '../components/ui/Card';
import WorkflowsTab from '../components/settings/WorkflowsTab';
import IntegrationsTab from '../components/settings/IntegrationsTab';
import Icon from '../components/ui/Icon';

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('integrations');

    const tabs = [
        { id: 'integrations', label: 'Integrations', icon: 'zap' },
        { id: 'workflows', label: 'Workflows', icon: 'briefcase' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Settings</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                    <Card className="p-0">
                         <div className="p-2 space-y-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium text-left ${
                                        activeTab === tab.id
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-text-secondary hover:bg-bg-default'
                                    }`}
                                >
                                    <Icon name={tab.icon as any} className="mr-3" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>
                <div className="md:col-span-3">
                    {activeTab === 'integrations' && <IntegrationsTab />}
                    {activeTab === 'workflows' && <WorkflowsTab />}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
