
import React, { createContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { api } from '../services/api';
import { Organization, User, Contact, Task, Lead, Workflow, Activity, Alert, Order } from '../types';

interface DataContextType {
    useOrganizations: (criteria?: { industry: string }) => UseQueryResult<Organization[], Error>;
    useOrganization: (id?: string) => UseQueryResult<Organization | null, Error>;
    useAddOrganization: () => UseMutationResult<Organization, Error, Omit<Organization, 'id' | 'contactCount' | 'createdAt'>>;
    useUpdateOrganization: () => UseMutationResult<Organization, Error, Organization>;
    useDeleteOrganization: () => UseMutationResult<{ success: true }, Error, string>;

    useUsers: (criteria?: { ids?: string[], organizationId?: string }) => UseQueryResult<User[], Error>;
    useTeamMembers: (organizationId?: string) => UseQueryResult<User[], Error>;
    useAddUser: () => UseMutationResult<User, Error, Omit<User, 'id'>>;
    useDeleteUser: () => UseMutationResult<{ success: true }, Error, string>;

    useContacts: (organizationId?: string) => UseQueryResult<Contact[], Error>;
    useContact: (contactId?: string, organizationId?: string) => UseQueryResult<Contact | null, Error>;
    useAddContact: () => UseMutationResult<Contact, Error, Omit<Contact, 'id'>>;
    useUpdateContact: () => UseMutationResult<Contact, Error, Contact>;
    
    useTasks: (criteria?: { organizationId?: string, contactId?: string, assignedTo?: string }) => UseQueryResult<Task[], Error>;
    useAddTask: () => UseMutationResult<Task, Error, Omit<Task, 'id'>>;
    useUpdateTask: () => UseMutationResult<Task, Error, Task>;
    
    useLeads: (organizationId?: string) => UseQueryResult<Lead[], Error>;
    useAddLead: () => UseMutationResult<Lead, Error, Omit<Lead, 'id'>>;
    useUpdateLead: () => UseMutationResult<Lead, Error, Lead>;
    
    useWorkflows: (organizationId?: string) => UseQueryResult<Workflow[], Error>;
    useAddWorkflow: () => UseMutationResult<Workflow, Error, Omit<Workflow, 'id'>>;
    useUpdateWorkflow: () => UseMutationResult<Workflow, Error, Workflow>;
    useDeleteWorkflow: () => UseMutationResult<{ success: true }, Error, string>;

    useActivities: (contactId: string) => UseQueryResult<Activity[], Error>;
    useAddActivity: () => UseMutationResult<Activity, Error, Omit<Activity, 'id'>>;
    
    useAlerts: (userId?: string) => UseQueryResult<Alert[], Error>;
    useMarkAlertAsRead: () => UseMutationResult<Alert, Error, string>;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const queryClient = useQueryClient();

    const contextValue: DataContextType = {
        // Organizations
        useOrganizations: (criteria) => useQuery({
            queryKey: ['organizations', criteria],
            queryFn: () => api.getOrganizations(criteria),
        }),
        useOrganization: (id) => useQuery({
            queryKey: ['organization', id],
            queryFn: () => id ? api.getOrganization(id) : null,
            enabled: !!id,
        }),
        useAddOrganization: () => useMutation({
            mutationFn: api.addOrganization,
            onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organizations'] }),
        }),
        useUpdateOrganization: () => useMutation({
            mutationFn: api.updateOrganization,
            onSuccess: (data) => {
                queryClient.invalidateQueries({ queryKey: ['organizations'] });
                queryClient.invalidateQueries({ queryKey: ['organization', data.id] });
            },
        }),
        useDeleteOrganization: () => useMutation({
            mutationFn: api.deleteOrganization,
            onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organizations'] }),
        }),
        
        // Users
        useUsers: (criteria) => useQuery({
            queryKey: ['users', criteria],
            queryFn: () => api.getUsers(criteria)
        }),
        useTeamMembers: (organizationId) => useQuery({
            queryKey: ['team', organizationId],
            queryFn: () => api.getUsers({ organizationId }),
            enabled: !!organizationId,
        }),
        useAddUser: () => useMutation({
            mutationFn: api.addUser,
            onSuccess: (data) => queryClient.invalidateQueries({ queryKey: ['team', data.organizationId] })
        }),
        useDeleteUser: () => useMutation({
            mutationFn: api.deleteUser,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['team'] });
            }
        }),

        // Contacts
        useContacts: (organizationId) => useQuery({
            queryKey: ['contacts', organizationId],
            queryFn: () => api.getContacts(organizationId),
            enabled: !!organizationId,
        }),
        useContact: (contactId, organizationId) => useQuery({
            queryKey: ['contact', contactId],
            queryFn: () => contactId && organizationId ? api.getContact(contactId, organizationId) : null,
            enabled: !!contactId && !!organizationId,
        }),
        useAddContact: () => useMutation({
            mutationFn: api.addContact,
            onSuccess: (data) => queryClient.invalidateQueries({ queryKey: ['contacts', data.organizationId] }),
        }),
        useUpdateContact: () => useMutation({
            mutationFn: api.updateContact,
            onSuccess: (data) => {
                queryClient.invalidateQueries({ queryKey: ['contacts', data.organizationId] });
                queryClient.invalidateQueries({ queryKey: ['contact', data.id] });
            },
        }),
        
        // Tasks
        useTasks: (criteria) => useQuery({
            queryKey: ['tasks', criteria],
            queryFn: () => api.getTasks(criteria),
        }),
        useAddTask: () => useMutation({
            mutationFn: api.addTask,
            onSuccess: (data) => {
                queryClient.invalidateQueries({ queryKey: ['tasks', { contactId: data.contactId }] });
                queryClient.invalidateQueries({ queryKey: ['tasks', { assignedTo: data.assignedTo }] });
            }
        }),
        useUpdateTask: () => useMutation({
            mutationFn: api.updateTask,
            onSuccess: (data) => {
                queryClient.invalidateQueries({ queryKey: ['tasks'] });
            }
        }),

        // Leads
        useLeads: (organizationId) => useQuery({
            queryKey: ['leads', organizationId],
            queryFn: () => api.getLeads(organizationId),
            enabled: !!organizationId,
        }),
        useAddLead: () => useMutation({
            mutationFn: api.addLead,
            onSuccess: (data) => queryClient.invalidateQueries({ queryKey: ['leads', data.organizationId] }),
        }),
        useUpdateLead: () => useMutation({
            mutationFn: api.updateLead,
            onSuccess: (data) => queryClient.invalidateQueries({ queryKey: ['leads', data.organizationId] }),
        }),

        // Workflows
        useWorkflows: (organizationId) => useQuery({
            queryKey: ['workflows', organizationId],
            queryFn: () => api.getWorkflows(organizationId),
            enabled: !!organizationId,
        }),
        useAddWorkflow: () => useMutation({
            mutationFn: api.addWorkflow,
            onSuccess: (data) => queryClient.invalidateQueries({ queryKey: ['workflows', data.organizationId] }),
        }),
        useUpdateWorkflow: () => useMutation({
            mutationFn: api.updateWorkflow,
            onSuccess: (data) => queryClient.invalidateQueries({ queryKey: ['workflows', data.organizationId] }),
        }),
        useDeleteWorkflow: () => useMutation({
            mutationFn: api.deleteWorkflow,
            onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] }),
        }),

        // Activities
        useActivities: (contactId: string) => useQuery({
            queryKey: ['activities', contactId],
            queryFn: () => api.getActivities(contactId),
            enabled: !!contactId,
        }),
        useAddActivity: () => useMutation({
            mutationFn: api.addActivity,
            onSuccess: (data) => queryClient.invalidateQueries({ queryKey: ['activities', data.contactId] }),
        }),
        
        // Alerts
        useAlerts: (userId) => useQuery({
            queryKey: ['alerts', userId],
            queryFn: () => userId ? api.getAlerts(userId) : [],
            enabled: !!userId,
        }),
        useMarkAlertAsRead: () => useMutation({
            mutationFn: api.markAlertAsRead,
            onSuccess: (data) => queryClient.invalidateQueries({ queryKey: ['alerts', data.userId] }),
        })
    };

    return <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>;
};
