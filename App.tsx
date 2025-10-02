import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { IndustryProvider } from './contexts/IndustryContext';
import { NotificationProvider } from './contexts/NotificationContext';

import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import Organizations from './pages/superadmin/Organizations';
import IndustriesPage from './pages/superadmin/IndustriesPage';
import TeamMemberConsole from './pages/teammember/TeamMemberConsole';
import TasksPage from './pages/teammember/TasksPage';
import ClientConsole from './pages/client/ClientConsole';
import ContactsPage from './pages/ContactsPage';
import ContactProfilePage from './pages/ContactProfilePage';
import DealsPage from './pages/DealsPage';
import TeamPage from './pages/TeamPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import SequencesPage from './pages/SequencesPage';
import WorkflowBuilderPage from './pages/WorkflowBuilderPage';
import TicketsPage from './pages/TicketsPage';
import TicketDetailPage from './pages/TicketDetailPage';

import { UserRole } from './types';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <AppProvider>
          <AuthProvider>
            <IndustryProvider>
              <DataProvider>
                <DndProvider backend={HTML5Backend}>
                  <Router>
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route path="/" element={
                        <ProtectedRoute roles={[UserRole.OrgAdmin, UserRole.SuperAdmin, UserRole.TeamMember, UserRole.Client]}>
                          <MainLayout />
                        </ProtectedRoute>
                      }>
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        
                        {/* Org Admin & Team Member Common Routes */}
                        <Route path="contacts" element={<ProtectedRoute roles={[UserRole.OrgAdmin, UserRole.TeamMember]}><ContactsPage /></ProtectedRoute>} />
                        <Route path="contacts/:contactId" element={<ProtectedRoute roles={[UserRole.OrgAdmin, UserRole.TeamMember]}><ContactProfilePage /></ProtectedRoute>} />
                        <Route path="tickets" element={<ProtectedRoute roles={[UserRole.OrgAdmin, UserRole.TeamMember]}><TicketsPage /></ProtectedRoute>} />
                        <Route path="tickets/:ticketId" element={<ProtectedRoute roles={[UserRole.OrgAdmin, UserRole.TeamMember]}><TicketDetailPage /></ProtectedRoute>} />
                        <Route path="my-tasks" element={<ProtectedRoute roles={[UserRole.OrgAdmin, UserRole.TeamMember]}><TasksPage /></ProtectedRoute>} />

                        {/* Org Admin Only Routes */}
                        <Route path="dashboard" element={<ProtectedRoute roles={[UserRole.OrgAdmin]}><Dashboard /></ProtectedRoute>} />
                        <Route path="deals" element={<ProtectedRoute roles={[UserRole.OrgAdmin]}><DealsPage /></ProtectedRoute>} />
                        <Route path="sequences" element={<ProtectedRoute roles={[UserRole.OrgAdmin]}><SequencesPage /></ProtectedRoute>} />
                        <Route path="team" element={<ProtectedRoute roles={[UserRole.OrgAdmin]}><TeamPage /></ProtectedRoute>} />
                        <Route path="reports" element={<ProtectedRoute roles={[UserRole.OrgAdmin]}><ReportsPage /></ProtectedRoute>} />
                        <Route path="settings" element={<ProtectedRoute roles={[UserRole.OrgAdmin]}><SettingsPage /></ProtectedRoute>} />
                        <Route path="settings/workflows/:workflowId" element={<ProtectedRoute roles={[UserRole.OrgAdmin]}><WorkflowBuilderPage /></ProtectedRoute>} />
                        <Route path="team/tasks/:userId" element={<ProtectedRoute roles={[UserRole.OrgAdmin]}><TasksPage /></ProtectedRoute>} />

                        {/* Super Admin Routes */}
                        <Route path="superadmin/dashboard" element={<ProtectedRoute roles={[UserRole.SuperAdmin]}><SuperAdminDashboard /></ProtectedRoute>} />
                        <Route path="superadmin/organizations" element={<ProtectedRoute roles={[UserRole.SuperAdmin]}><Organizations /></ProtectedRoute>} />
                        <Route path="superadmin/industries" element={<ProtectedRoute roles={[UserRole.SuperAdmin]}><IndustriesPage /></ProtectedRoute>} />

                        {/* Team Member Routes */}
                        <Route path="team-member" element={<ProtectedRoute roles={[UserRole.TeamMember]}><TeamMemberConsole /></ProtectedRoute>} />
                        
                        {/* Client Routes */}
                        <Route path="client/*" element={<ProtectedRoute roles={[UserRole.Client]}><ClientConsole /></ProtectedRoute>} />

                      </Route>
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Router>
                </DndProvider>
              </DataProvider>
            </IndustryProvider>
          </AuthProvider>
        </AppProvider>
      </NotificationProvider>
    </QueryClientProvider>
  );
}

export default App;