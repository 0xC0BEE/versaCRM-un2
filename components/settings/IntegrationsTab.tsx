
import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useAppContext } from '../../hooks/useAppContext';
import Icon from '../ui/Icon';

const MOCK_INTEGRATIONS = [
    { id: 'slack', name: 'Slack', description: 'Send task notifications to Slack channels.' },
    { id: 'googleCalendar', name: 'Google Calendar', description: 'Sync your CRM tasks with Google Calendar.' },
];

const IntegrationsTab: React.FC = () => {
    const { integrations, connectIntegration, disconnectIntegration } = useAppContext();

    return (
        <Card title="App Marketplace">
            <div className="space-y-4">
                {MOCK_INTEGRATIONS.map(integration => {
                    const isConnected = integrations[integration.id as keyof typeof integrations];
                    return (
                        <div key={integration.id} className="flex items-center justify-between p-4 border border-border-default rounded-lg bg-bg-default">
                            <div>
                                <h4 className="font-semibold text-text-default">{integration.name}</h4>
                                <p className="text-sm text-text-secondary">{integration.description}</p>
                            </div>
                            {isConnected ? (
                                <Button variant="secondary" onClick={() => disconnectIntegration(integration.id as any)}>
                                    Disconnect
                                </Button>
                            ) : (
                                <Button variant="primary" onClick={() => connectIntegration(integration.id as any)}>
                                    Connect
                                </Button>
                            )}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};

export default IntegrationsTab;
