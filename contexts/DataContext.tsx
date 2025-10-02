import React, { createContext } from 'react';
import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { api } from '../services/api';
import {
    User, Organization, Contact, Task, Lead, Workflow, Activity, Alert, Order,
    EmailTemplate, Sequence, SequenceEnrollment, DashboardWidget, Document, DirectMessage,
    LeadScoringRule, KnowledgeBaseArticle, Ticket, TicketComment, EnrollmentStatus,
    SLAPolicy, UserRole,
    ActivityType
} from '../types';
import { useNotification } from '../hooks/useNotification';

// FIX: Define a type for database entity keys to fix type errors in generic mutations.
type DbEntityKey = 'organizations' | 'users' | 'contacts' | 'tasks' | 'leads' | 'workflows' | 'activities' | 'alerts' | 'orders' | 'emailTemplates' | 'sequences' | 'sequenceEnrollments' | 'dashboardWidgets' | 'documents' | 'directMessages' | 'leadScoringRules' | 'knowledgeBaseArticles' | 'tickets' | 'ticketComments' | 'slaPolicies';

// A generic type for our entities
type Entity =
  | User
  | Organization
  | Contact
  | Task
  | Lead
  | Workflow
  | Activity
  | Alert
  | Order
  | EmailTemplate
  | Sequence
  | SequenceEnrollment
  | DashboardWidget
  | Document
  | DirectMessage
  | LeadScoringRule
  | KnowledgeBaseArticle
  | Ticket
  | TicketComment
  | SLAPolicy;

// The shape of the context
interface DataContextType {
  // Organizations
  useOrganizations: (filters?: Record<string, any>) => UseQueryResult<Organization[], Error>;
  useOrganization: (id?: string) => UseQueryResult<Organization | null, Error>;
  useAddOrganization: () => UseMutationResult<Organization, Error, Omit<Organization, 'id' | 'contactCount' | 'createdAt'>, unknown>;
  useUpdateOrganization: () => UseMutationResult<Organization, Error, Organization, unknown>;
  useDeleteOrganization: () => UseMutationResult<{ id: string; }, Error, string, unknown>;

  // Users
  useUsers: (filters?: Record<string, any>) => UseQueryResult<User[], Error>;
  useTeamMembers: (organizationId?: string) => UseQueryResult<User[], Error>;
  useAddUser: () => UseMutationResult<User, Error, Omit<User, 'id'>, unknown>;
  useDeleteUser: () => UseMutationResult<{ id: string; }, Error, string, unknown>;

  // Contacts
  useContacts: (organizationId?: string) => UseQueryResult<Contact[], Error>;
  useContact: (id?: string, organizationId?: string) => UseQueryResult<Contact | null, Error>;
  useAddContact: () => UseMutationResult<Contact, Error, Omit<Contact, 'id'>, unknown>;
  useUpdateContact: () => UseMutationResult<Contact, Error, Contact, unknown>;

  // Leads
  useLeads: (organizationId?: string) => UseQueryResult<Lead[], Error>;
  useAddLead: () => UseMutationResult<Lead, Error, Omit<Lead, 'id'>, unknown>;
  useUpdateLead: () => UseMutationResult<Lead, Error, Lead, unknown>;

  // Tasks
  useTasks: (filters?: Record<string, any>) => UseQueryResult<Task[], Error>;
  useAddTask: () => UseMutationResult<Task, Error, Omit<Task, 'id'>, unknown>;
  useUpdateTask: () => UseMutationResult<Task, Error, Task, unknown>;

  // Workflows
  useWorkflows: (organizationId?: string) => UseQueryResult<Workflow[], Error>;
  useAddWorkflow: () => UseMutationResult<Workflow, Error, Omit<Workflow, 'id'>, unknown>;
  useUpdateWorkflow: () => UseMutationResult<Workflow, Error, Workflow, unknown>;
  useDeleteWorkflow: () => UseMutationResult<{ id: string; }, Error, string, unknown>;

  // Activities
  useActivities: (contactId: string) => UseQueryResult<Activity[], Error>;
  useAddActivity: () => UseMutationResult<Activity, Error, Omit<Activity, 'id'>, unknown>;

  // Alerts
  useAlerts: (userId?: string) => UseQueryResult<Alert[], Error>;
  useMarkAlertAsRead: () => UseMutationResult<Alert, Error, string, unknown>;

  // Documents
  useDocuments: (contactId?: string) => UseQueryResult<Document[], Error>;
  useAddDocument: () => UseMutationResult<Document, Error, Omit<Document, 'id'>, unknown>;
  useUpdateDocument: () => UseMutationResult<Document, Error, Document, unknown>;
  useDeleteDocument: () => UseMutationResult<{ id: string }, Error, string, unknown>;
  
  // Direct Messages
  useDirectMessages: (contactId: string) => UseQueryResult<DirectMessage[], Error>;
  useAddDirectMessage: () => UseMutationResult<DirectMessage, Error, Omit<DirectMessage, 'id' | 'createdAt' | 'read'>, unknown>;

  // Sequences
  useSequences: (organizationId?: string) => UseQueryResult<Sequence[], Error>;
  useAddSequence: () => UseMutationResult<Sequence, Error, Omit<Sequence, 'id'>, unknown>;
  useUpdateSequence: () => UseMutationResult<Sequence, Error, Sequence, unknown>;
  useDeleteSequence: () => UseMutationResult<{ id: string }, Error, string, unknown>;

  // Enrollments
  useSequenceEnrollments: (filters?: Record<string, any>) => UseQueryResult<SequenceEnrollment[], Error>;
  useEnrollContactInSequence: () => UseMutationResult<SequenceEnrollment, Error, { contactId: string; sequenceId: string; organizationId: string; userId: string; sequenceName: string; }, unknown>;

  // Email Templates
  useEmailTemplates: (organizationId?: string) => UseQueryResult<EmailTemplate[], Error>;

  // Widgets
  useDashboardWidgets: (organizationId?: string) => UseQueryResult<DashboardWidget[], Error>;
  useAddDashboardWidget: () => UseMutationResult<DashboardWidget, Error, Omit<DashboardWidget, 'id'>, unknown>;
  useDeleteDashboardWidget: () => UseMutationResult<{ id: string }, Error, string, unknown>;

  // Lead Scoring
  useLeadScoringRules: (organizationId?: string) => UseQueryResult<LeadScoringRule[], Error>;
  useAddLeadScoringRule: () => UseMutationResult<LeadScoringRule, Error, Omit<LeadScoringRule, 'id'>, unknown>;
  useDeleteLeadScoringRule: () => UseMutationResult<{ id: string }, Error, string, unknown>;

  // Knowledge Base
  useKnowledgeBaseArticles: (organizationId?: string) => UseQueryResult<KnowledgeBaseArticle[], Error>;
  useAddKnowledgeBaseArticle: () => UseMutationResult<KnowledgeBaseArticle, Error, Omit<KnowledgeBaseArticle, 'id'>, unknown>;
  useUpdateKnowledgeBaseArticle: () => UseMutationResult<KnowledgeBaseArticle, Error, KnowledgeBaseArticle, unknown>;
  useDeleteKnowledgeBaseArticle: () => UseMutationResult<{ id: string }, Error, string, unknown>;

  // Tickets
  useTickets: (filters?: Record<string, any>) => UseQueryResult<Ticket[], Error>;
  useTicket: (ticketId?: string) => UseQueryResult<Ticket | null, Error>;
  useAddTicket: () => UseMutationResult<Ticket, Error, Omit<Ticket, 'id' | 'slaDueAt' | 'firstRespondedAt'>, unknown>;
  useUpdateTicket: () => UseMutationResult<Ticket, Error, Ticket, unknown>;

  // Ticket Comments
  useTicketComments: (ticketId?: string) => UseQueryResult<TicketComment[], Error>;
  useAddTicketComment: () => UseMutationResult<TicketComment, Error, Omit<TicketComment, 'id'>, unknown>;
  
  // SLA Policies
  useSLAPolicies: (organizationId?: string) => UseQueryResult<SLAPolicy[], Error>;
  useUpdateSLAPolicy: () => UseMutationResult<SLAPolicy, Error, SLAPolicy, unknown>;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotification();

  const createGenericMutation = <T extends Entity, TData extends Omit<T, 'id'>>(
    // FIX: Corrected the type of `entity` to be a key of the database.
    entity: DbEntityKey,
    entityName: string,
    onSuccessMessage: string,
    onErrorMessage: string,
    invalidateKeys?: any[]
  ) => {
    return useMutation<T, Error, TData>({
      mutationFn: (data: TData) => api.addGeneric<T>(entity, data as any),
      onSuccess: () => {
        addNotification(onSuccessMessage, 'success');
        queryClient.invalidateQueries({ queryKey: [entity, ...(invalidateKeys || [])] });
      },
      onError: () => addNotification(onErrorMessage, 'error'),
    });
  };

  const updateGenericMutation = <T extends Entity & { id: string }>(
    // FIX: Corrected the type of `entity` to be a key of the database.
    entity: DbEntityKey,
    entityName: string,
    onSuccessMessage: string,
    onErrorMessage: string
  ) => {
    return useMutation<T, Error, T>({
      mutationFn: (data: T) => api.updateGeneric<T>(entity, data),
      onSuccess: (data) => {
        addNotification(onSuccessMessage, 'success');
        queryClient.invalidateQueries({ queryKey: [entity] });
        queryClient.invalidateQueries({ queryKey: [entity, data.id] });
      },
      onError: () => addNotification(onErrorMessage, 'error'),
    });
  };

  const deleteGenericMutation = (
    // FIX: Corrected the type of `entity` to be a key of the database.
    entity: DbEntityKey,
    entityName: string,
    onSuccessMessage: string,
    onErrorMessage: string
  ) => {
    return useMutation<{ id: string }, Error, string>({
      mutationFn: (id: string) => api.deleteGeneric(entity, id),
      onSuccess: () => {
        addNotification(onSuccessMessage, 'success');
        queryClient.invalidateQueries({ queryKey: [entity] });
      },
      onError: () => addNotification(onErrorMessage, 'error'),
    });
  };
  
  const value: DataContextType = {
    // Organizations
    useOrganizations: (filters?: Record<string, any>) => useQuery({
        queryKey: ['organizations', filters],
        queryFn: () => api.getGeneric<Organization>('organizations', filters),
    }),
    useOrganization: (id?: string) => useQuery({
        queryKey: ['organizations', id],
        queryFn: () => api.getGenericById<Organization>('organizations', id!),
        enabled: !!id,
    }),
    useAddOrganization: () => useMutation<Organization, Error, Omit<Organization, 'id' | 'contactCount' | 'createdAt'>>({
        mutationFn: (data) => api.addGeneric('organizations', { ...data, contactCount: 0, createdAt: new Date().toISOString() }),
        onSuccess: () => {
            addNotification('Organization added successfully', 'success');
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
        },
        onError: () => addNotification('Failed to add organization', 'error'),
    }),
    useUpdateOrganization: () => updateGenericMutation<Organization>('organizations', 'Organization', 'Organization updated', 'Failed to update organization'),
    useDeleteOrganization: () => useMutation<{ id: string }, Error, string>({
        mutationFn: (id) => api.deleteOrganization(id),
        onSuccess: () => {
            addNotification('Organization deleted successfully', 'success');
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
        },
        onError: () => addNotification('Failed to delete organization', 'error'),
    }),

    // Users
    useUsers: (filters?: Record<string, any>) => useQuery({
        queryKey: ['users', filters],
        queryFn: () => api.getGeneric<User>('users', filters),
    }),
    useTeamMembers: (organizationId?: string) => useQuery({
        queryKey: ['users', { organizationId, role: ['Team Member', 'Organization Admin'] }],
        queryFn: () => api.getGeneric<User>('users', { organizationId }),
        enabled: !!organizationId,
    }),
    useAddUser: () => createGenericMutation<User, Omit<User, 'id'>>('users', 'User', 'User added', 'Failed to add user'),
    useDeleteUser: () => deleteGenericMutation('users', 'User', 'User deleted', 'Failed to delete user'),

    // Contacts
    useContacts: (organizationId?: string) => useQuery({
        queryKey: ['contacts', { organizationId }],
        queryFn: () => api.getGeneric<Contact>('contacts', { organizationId }),
        enabled: !!organizationId,
    }),
    useContact: (id?: string, organizationId?: string) => useQuery({
        queryKey: ['contacts', id],
        queryFn: () => api.getContact(id!, organizationId!),
        enabled: !!id && !!organizationId,
    }),
    useAddContact: () => createGenericMutation<Contact, Omit<Contact, 'id'>>('contacts', 'Contact', 'Contact added', 'Failed to add contact'),
    useUpdateContact: () => updateGenericMutation<Contact>('contacts', 'Contact', 'Contact updated', 'Failed to update contact'),

    // Leads
    useLeads: (organizationId?: string) => useQuery({
        queryKey: ['leads', { organizationId }],
        queryFn: () => api.getGeneric<Lead>('leads', { organizationId }),
        enabled: !!organizationId,
    }),
    useAddLead: () => createGenericMutation<Lead, Omit<Lead, 'id'>>('leads', 'Lead', 'Lead added', 'Failed to add lead'),
    useUpdateLead: () => updateGenericMutation<Lead>('leads', 'Lead', 'Lead updated', 'Failed to update lead'),

    // Tasks
    useTasks: (filters?: Record<string, any>) => useQuery({
        queryKey: ['tasks', filters],
        queryFn: () => api.getGeneric<Task>('tasks', filters),
    }),
    useAddTask: () => createGenericMutation<Task, Omit<Task, 'id'>>('tasks', 'Task', 'Task added', 'Failed to add task'),
    useUpdateTask: () => updateGenericMutation<Task>('tasks', 'Task', 'Task updated', 'Failed to update task'),

    // Workflows
    useWorkflows: (organizationId?: string) => useQuery({
        queryKey: ['workflows', { organizationId }],
        queryFn: () => api.getGeneric<Workflow>('workflows', { organizationId }),
        enabled: !!organizationId,
    }),
    useAddWorkflow: () => createGenericMutation<Workflow, Omit<Workflow, 'id'>>('workflows', 'Workflow', 'Workflow created', 'Failed to create workflow'),
    useUpdateWorkflow: () => updateGenericMutation<Workflow>('workflows', 'Workflow', 'Workflow updated', 'Failed to update workflow'),
    useDeleteWorkflow: () => deleteGenericMutation('workflows', 'Workflow', 'Workflow deleted', 'Failed to delete workflow'),

    // Activities
    useActivities: (contactId: string) => useQuery({
        queryKey: ['activities', { contactId }],
        queryFn: () => api.getGeneric<Activity>('activities', { contactId }),
        enabled: !!contactId,
    }),
    useAddActivity: () => useMutation<Activity, Error, Omit<Activity, 'id'>>({
        mutationFn: data => api.addGeneric('activities', data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['activities', { contactId: data.contactId }] });
        },
    }),

    // Alerts
    useAlerts: (userId?: string) => useQuery({
        queryKey: ['alerts', { userId }],
        queryFn: () => api.getGeneric<Alert>('alerts', { userId }),
        enabled: !!userId,
    }),
    useMarkAlertAsRead: () => useMutation<Alert, Error, string>({
        mutationFn: async (alertId) => {
            const alert = await api.getGenericById<Alert>('alerts', alertId);
            if (!alert) throw new Error('Alert not found');
            return api.updateGeneric('alerts', { ...alert, read: true });
        },
        onSuccess: (_, alertId) => {
            queryClient.invalidateQueries({ queryKey: ['alerts'] });
        }
    }),

    // Documents
    useDocuments: (contactId?: string) => useQuery({
        queryKey: ['documents', { contactId }],
        queryFn: () => api.getGeneric<Document>('documents', { contactId }),
        enabled: !!contactId,
    }),
    useAddDocument: () => createGenericMutation<Document, Omit<Document, 'id'>>('documents', 'Document', 'Document added', 'Failed to add document'),
    useUpdateDocument: () => updateGenericMutation<Document>('documents', 'Document', 'Document updated', 'Failed to update document'),
    useDeleteDocument: () => deleteGenericMutation('documents', 'Document', 'Document deleted', 'Failed to delete document'),
    
    // Direct Messages
    useDirectMessages: (contactId: string) => useQuery({
        queryKey: ['directMessages', { contactId }],
        queryFn: () => api.getGeneric<DirectMessage>('directMessages', { contactId }),
        enabled: !!contactId,
    }),
    useAddDirectMessage: () => useMutation<DirectMessage, Error, Omit<DirectMessage, 'id' | 'createdAt' | 'read'>>({
        mutationFn: (data) => api.addGeneric('directMessages', { ...data, createdAt: new Date().toISOString(), read: false }),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['directMessages', { contactId: data.contactId }] });
        }
    }),
    
    // Sequences
    useSequences: (organizationId?: string) => useQuery({
        queryKey: ['sequences', { organizationId }],
        queryFn: () => api.getGeneric<Sequence>('sequences', { organizationId }),
        enabled: !!organizationId,
    }),
    useAddSequence: () => createGenericMutation<Sequence, Omit<Sequence, 'id'>>('sequences', 'Sequence', 'Sequence created', 'Failed to create sequence'),
    useUpdateSequence: () => updateGenericMutation<Sequence>('sequences', 'Sequence', 'Sequence updated', 'Failed to update sequence'),
    useDeleteSequence: () => deleteGenericMutation('sequences', 'Sequence', 'Sequence deleted', 'Failed to delete sequence'),

    // Enrollments
    useSequenceEnrollments: (filters?: Record<string, any>) => useQuery({
        queryKey: ['sequenceEnrollments', filters],
        queryFn: () => api.getGeneric<SequenceEnrollment>('sequenceEnrollments', filters),
    }),
    useEnrollContactInSequence: () => useMutation<SequenceEnrollment, Error, { contactId: string; sequenceId: string; organizationId: string; userId: string; sequenceName: string }, any>({
        mutationFn: (data) => api.addGeneric('sequenceEnrollments', {
            contactId: data.contactId,
            sequenceId: data.sequenceId,
            status: EnrollmentStatus.Active,
            enrolledAt: new Date().toISOString(),
            currentStep: 1,
            nextStepDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        }),
        onSuccess: (enrollmentData, variables) => {
            api.addGeneric<Activity>('activities', {
                contactId: variables.contactId,
                organizationId: variables.organizationId,
                type: ActivityType.Sequence,
                content: `Enrolled in sequence: "${variables.sequenceName}"`,
                createdAt: new Date().toISOString(),
                createdBy: variables.userId,
            });
            queryClient.invalidateQueries({ queryKey: ['sequenceEnrollments'] });
            queryClient.invalidateQueries({ queryKey: ['activities', { contactId: variables.contactId }] });
        },
    }),

    // Email Templates
    useEmailTemplates: (organizationId?: string) => useQuery({
        queryKey: ['emailTemplates', { organizationId }],
        queryFn: () => api.getGeneric<EmailTemplate>('emailTemplates', { organizationId }),
        enabled: !!organizationId,
    }),
    
    // Widgets
    useDashboardWidgets: (organizationId?: string) => useQuery({
        queryKey: ['dashboardWidgets', { organizationId }],
        queryFn: () => api.getGeneric<DashboardWidget>('dashboardWidgets', { organizationId }),
        enabled: !!organizationId,
    }),
    useAddDashboardWidget: () => createGenericMutation<DashboardWidget, Omit<DashboardWidget, 'id'>>('dashboardWidgets', 'Widget', 'Widget created', 'Failed to create widget'),
    useDeleteDashboardWidget: () => deleteGenericMutation('dashboardWidgets', 'Widget', 'Widget deleted', 'Failed to delete widget'),

    // Lead Scoring
    useLeadScoringRules: (organizationId?: string) => useQuery({
        queryKey: ['leadScoringRules', { organizationId }],
        queryFn: () => api.getGeneric<LeadScoringRule>('leadScoringRules', { organizationId }),
        enabled: !!organizationId,
    }),
    useAddLeadScoringRule: () => createGenericMutation<LeadScoringRule, Omit<LeadScoringRule, 'id'>>('leadScoringRules', 'Rule', 'Rule added', 'Failed to add rule'),
    useDeleteLeadScoringRule: () => deleteGenericMutation('leadScoringRules', 'Rule', 'Rule deleted', 'Failed to delete rule'),
    
    // Knowledge Base
    useKnowledgeBaseArticles: (organizationId?: string) => useQuery({
        queryKey: ['knowledgeBaseArticles', { organizationId }],
        queryFn: () => api.getGeneric<KnowledgeBaseArticle>('knowledgeBaseArticles', { organizationId }),
        enabled: !!organizationId,
    }),
    useAddKnowledgeBaseArticle: () => createGenericMutation<KnowledgeBaseArticle, Omit<KnowledgeBaseArticle, 'id'>>('knowledgeBaseArticles', 'Article', 'Article created', 'Failed to create article'),
    useUpdateKnowledgeBaseArticle: () => updateGenericMutation<KnowledgeBaseArticle>('knowledgeBaseArticles', 'Article', 'Article updated', 'Failed to update article'),
    useDeleteKnowledgeBaseArticle: () => deleteGenericMutation('knowledgeBaseArticles', 'Article', 'Article deleted', 'Failed to delete article'),
    
    // Tickets
    useTickets: (filters?: Record<string, any>) => useQuery({
        queryKey: ['tickets', filters],
        queryFn: () => api.getGeneric<Ticket>('tickets', filters),
    }),
    useTicket: (ticketId?: string) => useQuery({
        queryKey: ['tickets', ticketId],
        queryFn: () => api.getGenericById<Ticket>('tickets', ticketId!),
        enabled: !!ticketId,
    }),
    useAddTicket: () => useMutation<Ticket, Error, Omit<Ticket, 'id' | 'slaDueAt' | 'firstRespondedAt'>>({
        mutationFn: async (data) => {
            const policies = await queryClient.fetchQuery<SLAPolicy[]>({ 
                queryKey: ['slaPolicies', { organizationId: data.organizationId }],
                queryFn: () => api.getGeneric('slaPolicies', { organizationId: data.organizationId }),
            });
            const policy = policies?.find(p => p.priority === data.priority);
            let slaDueAt: string | undefined = undefined;
            if (policy) {
                const dueDate = new Date(data.createdAt);
                dueDate.setHours(dueDate.getHours() + policy.responseTimeHours);
                slaDueAt = dueDate.toISOString();
            }
            return api.addGeneric<Ticket>('tickets', { ...data, slaDueAt });
        },
        onSuccess: () => {
            addNotification('Ticket created', 'success');
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
        onError: () => addNotification('Failed to create ticket', 'error'),
    }),
    useUpdateTicket: () => updateGenericMutation<Ticket>('tickets', 'Ticket', 'Ticket updated', 'Failed to update ticket'),
    
    // Ticket Comments
    useTicketComments: (ticketId?: string) => useQuery({
        queryKey: ['ticketComments', { ticketId }],
        queryFn: () => api.getGeneric<TicketComment>('ticketComments', { ticketId }),
        enabled: !!ticketId,
    }),
    useAddTicketComment: () => useMutation<TicketComment, Error, Omit<TicketComment, 'id'>>({
        mutationFn: async (commentData) => {
            // FIX: Explicitly set the generic type for api.addGeneric to fix type inference issues.
            const comment = await api.addGeneric<TicketComment>('ticketComments', commentData);
            
            // Check if this is the first response from a non-client user
            const ticket = await api.getGenericById<Ticket>('tickets', commentData.ticketId);
            const author = await api.getGenericById<User>('users', comment.authorId);

            if (ticket && !ticket.firstRespondedAt && author && author.role !== UserRole.Client) {
                await api.updateGeneric('tickets', { ...ticket, firstRespondedAt: comment.createdAt });
            }
            return comment;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['ticketComments', { ticketId: data.ticketId }] });
            queryClient.invalidateQueries({ queryKey: ['tickets', data.ticketId] });
            queryClient.invalidateQueries({ queryKey: ['tickets'] }); // For updatedAt
        },
    }),
    
    // SLA Policies
    useSLAPolicies: (organizationId?: string) => useQuery({
        queryKey: ['slaPolicies', { organizationId }],
        queryFn: () => api.getGeneric<SLAPolicy>('slaPolicies', { organizationId }),
        enabled: !!organizationId,
    }),
    useUpdateSLAPolicy: () => updateGenericMutation<SLAPolicy>('slaPolicies', 'SLA Policy', 'SLA Policy updated', 'Failed to update policy'),
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};