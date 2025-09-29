
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AIAssistant from './AIAssistant';
import Card from '../../components/ui/Card';

const BillingPage = () => (
    <Card title="Billing">
        <p>Your billing information and history will be displayed here. This feature is under construction.</p>
    </Card>
);

const ClientConsole: React.FC = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="ai-assistant" replace />} />
      <Route path="ai-assistant" element={<AIAssistant />} />
      <Route path="billing" element={<BillingPage />} />
    </Routes>
  );
};

export default ClientConsole;
