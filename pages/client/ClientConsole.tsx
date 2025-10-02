
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AIAssistant from './AIAssistant';
import ClientTicketsPage from './TicketsPage';
import ClientTicketDetailPage from './TicketDetailPage';
import MessagesPage from './MessagesPage';
import TasksPage from './TasksPage';
import DocumentsPage from './DocumentsPage';
import NotFound from '../NotFound';
import Card from '../../components/ui/Card';

// A placeholder for the billing page since it's in the sidebar but not provided.
const BillingPagePlaceholder: React.FC = () => (
    <Card title="Billing">
        <div className="text-center p-8">
            <h2 className="text-xl font-semibold mb-2">Billing Information</h2>
            <p className="text-text-secondary">Your billing details and history will appear here.</p>
        </div>
    </Card>
);


const ClientConsole: React.FC = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="ai-assistant" replace />} />
      <Route path="ai-assistant" element={<AIAssistant />} />
      <Route path="tickets" element={<ClientTicketsPage />} />
      <Route path="tickets/:ticketId" element={<ClientTicketDetailPage />} />
      <Route path="messages" element={<MessagesPage />} />
      <Route path="tasks" element={<TasksPage />} />
      <Route path="documents" element={<DocumentsPage />} />
      <Route path="billing" element={<BillingPagePlaceholder />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default ClientConsole;