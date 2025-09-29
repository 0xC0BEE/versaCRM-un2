
import { MOCK_DB } from '../data/mockData';
import { User, Organization, Contact, Task, Lead, Workflow, Activity, Alert, Order, UserRole, Industry, ContactStatus } from '../types';

// Simple deep copy to avoid modifying the original mock data on import
let db = JSON.parse(JSON.stringify(MOCK_DB));

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

// A little function to simulate filtering like a WHERE clause
const filterBy = <T>(collection: T[], criteria?: Record<string, any>): T[] => {
    if (!criteria || Object.keys(criteria).length === 0) return collection;
    return collection.filter(item => {
        for (const key in criteria) {
            if (item[key as keyof T] !== criteria[key]) {
                return false;
            }
        }
        return true;
    });
};

export const api = {
    // Auth
    login: async (email: string): Promise<User | null> => {
        await delay(300);
        const user = db.users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
        return user || null;
    },

    // Generic fetcher
    getGeneric: async <T>(collectionName: keyof typeof db, criteria?: Record<string, any>): Promise<T[]> => {
        await delay(400);
        return filterBy<T>(db[collectionName], criteria);
    },

    // Organizations
    getOrganizations: async (criteria?: { industry: string }): Promise<Organization[]> => {
        await delay(500);
        return filterBy<Organization>(db.organizations, criteria);
    },
    getOrganization: async (id: string): Promise<Organization | null> => {
        await delay(300);
        return db.organizations.find((o: Organization) => o.id === id) || null;
    },
    addOrganization: async (org: Omit<Organization, 'id' | 'contactCount' | 'createdAt'>): Promise<Organization> => {
        await delay(500);
        const newOrg: Organization = {
            id: generateId('org'),
            ...org,
            contactCount: 0,
            createdAt: new Date().toISOString()
        };
        db.organizations.push(newOrg);
        return newOrg;
    },
    updateOrganization: async (org: Organization): Promise<Organization> => {
        await delay(500);
        const index = db.organizations.findIndex((o: Organization) => o.id === org.id);
        if (index > -1) {
            db.organizations[index] = org;
            return org;
        }
        throw new Error("Organization not found");
    },
    deleteOrganization: async (id: string): Promise<{ success: true }> => {
        await delay(500);
        db.organizations = db.organizations.filter((o: Organization) => o.id !== id);
        // Also delete related users, contacts, etc.
        db.users = db.users.filter((u: User) => u.organizationId !== id);
        db.contacts = db.contacts.filter((c: Contact) => c.organizationId !== id);
        return { success: true };
    },

    // Users (Team)
    getUsers: async (criteria?: { ids?: string[], organizationId?: string }): Promise<User[]> => {
        await delay(400);
        if (criteria?.ids) {
            return db.users.filter((u: User) => criteria.ids?.includes(u.id));
        }
        return filterBy<User>(db.users, criteria);
    },
    addUser: async(user: Omit<User, 'id'>): Promise<User> => {
        await delay(500);
        const newUser = { ...user, id: generateId('user')};
        db.users.push(newUser);
        return newUser;
    },
     deleteUser: async(id: string): Promise<{success: true}> => {
        await delay(500);
        db.users = db.users.filter((u: User) => u.id !== id);
        return { success: true };
    },

    // Contacts
    getContacts: async (organizationId?: string): Promise<Contact[]> => {
        await delay(600);
        if (!organizationId) return [];
        return db.contacts.filter((c: Contact) => c.organizationId === organizationId);
    },
    getContact: async (contactId: string, organizationId: string): Promise<Contact | null> => {
        await delay(300);
        return db.contacts.find((c: Contact) => c.id === contactId && c.organizationId === organizationId) || null;
    },
    addContact: async (contact: Omit<Contact, 'id'>): Promise<Contact> => {
        await delay(500);
        const newContact: Contact = {
            id: generateId('contact'),
            ...contact,
        } as Contact;
        db.contacts.push(newContact);
        const orgIndex = db.organizations.findIndex((o: Organization) => o.id === contact.organizationId);
        if (orgIndex > -1) db.organizations[orgIndex].contactCount++;
        return newContact;
    },
    updateContact: async (contact: Contact): Promise<Contact> => {
        await delay(500);
        const index = db.contacts.findIndex((c: Contact) => c.id === contact.id);
        if (index > -1) {
            db.contacts[index] = contact;
            return contact;
        }
        throw new Error("Contact not found");
    },

    // Tasks
    getTasks: async (criteria?: { organizationId?: string, contactId?: string, assignedTo?: string }): Promise<Task[]> => {
        await delay(400);
        return filterBy<Task>(db.tasks, criteria);
    },
    addTask: async (task: Omit<Task, 'id'>): Promise<Task> => {
        await delay(300);
        const newTask = { ...task, id: generateId('task') };
        db.tasks.push(newTask);
        return newTask;
    },
    updateTask: async (task: Task): Promise<Task> => {
        await delay(200);
        const index = db.tasks.findIndex((t: Task) => t.id === task.id);
        if (index > -1) {
            db.tasks[index] = task;
            return task;
        }
        throw new Error("Task not found");
    },
    
    // Leads
    getLeads: async (organizationId?: string): Promise<Lead[]> => {
        await delay(500);
        if (!organizationId) return [];
        return db.leads.filter((l: Lead) => l.organizationId === organizationId);
    },
    addLead: async (lead: Omit<Lead, 'id'>): Promise<Lead> => {
        await delay(400);
        const newLead = { ...lead, id: generateId('lead') } as Lead;
        db.leads.push(newLead);
        return newLead;
    },
    updateLead: async (lead: Lead): Promise<Lead> => {
        await delay(300);
        const index = db.leads.findIndex((l: Lead) => l.id === lead.id);
        if (index > -1) {
            db.leads[index] = lead;
            return lead;
        }
        throw new Error("Lead not found");
    },

    // Workflows
    getWorkflows: async (organizationId?: string): Promise<Workflow[]> => {
        await delay(400);
        return filterBy(db.workflows, { organizationId });
    },
    addWorkflow: async (workflow: Omit<Workflow, 'id'>): Promise<Workflow> => {
        await delay(400);
        const newWorkflow = { ...workflow, id: generateId('wf') };
        db.workflows.push(newWorkflow);
        return newWorkflow;
    },
    updateWorkflow: async (workflow: Workflow): Promise<Workflow> => {
        await delay(300);
        const index = db.workflows.findIndex((w: Workflow) => w.id === workflow.id);
        if (index > -1) db.workflows[index] = workflow;
        return workflow;
    },
    deleteWorkflow: async (id: string): Promise<{ success: true }> => {
        await delay(500);
        db.workflows = db.workflows.filter((w: Workflow) => w.id !== id);
        return { success: true };
    },

    // Activities
    getActivities: async (contactId: string): Promise<Activity[]> => {
        await delay(400);
        return db.activities.filter((a: Activity) => a.contactId === contactId).sort((a: Activity, b: Activity) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    addActivity: async (activity: Omit<Activity, 'id'>): Promise<Activity> => {
        await delay(300);
        const newActivity = { ...activity, id: generateId('act') };
        db.activities.push(newActivity);
        return newActivity;
    },
    
    // Alerts
    getAlerts: async (userId: string): Promise<Alert[]> => {
        await delay(200);
        return db.alerts.filter((a: Alert) => a.userId === userId).sort((a: Alert, b: Alert) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    markAlertAsRead: async (alertId: string): Promise<Alert> => {
        await delay(100);
        const index = db.alerts.findIndex((a: Alert) => a.id === alertId);
        if (index > -1) {
            db.alerts[index].read = true;
            return db.alerts[index];
        }
        throw new Error("Alert not found");
    }
};
