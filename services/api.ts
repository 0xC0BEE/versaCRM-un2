import { MOCK_DB } from '../data/mockData';
import { 
    User, Organization, Contact, Task, Lead, Workflow, Activity, Alert, Order,
    EmailTemplate, Sequence, SequenceEnrollment, DashboardWidget, Document,
    DirectMessage, LeadScoringRule, KnowledgeBaseArticle, Ticket, TicketComment, SLAPolicy
} from '../types';

// Deep copy the mock DB to avoid modifying the original data during the session
let db = JSON.parse(JSON.stringify(MOCK_DB));

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

const api = {
  // Generic getter
  async getGeneric<T>(
    entity: keyof typeof db,
    filters?: Record<string, any>
  ): Promise<T[]> {
    await simulateDelay(200);
    let results: any[] = [...db[entity]];
    if (filters) {
      results = results.filter((item: any) => {
        return Object.entries(filters).every(([key, value]) => {
          if (value === undefined || value === null) return true;
          if (key === 'ids' && Array.isArray(value)) {
              return value.includes(item.id);
          }
          if (Array.isArray(value)) {
            return value.includes(item[key]);
          }
          return item[key] === value;
        });
      });
    }
    return JSON.parse(JSON.stringify(results));
  },
  
  // Generic getter for single item
  async getGenericById<T extends { id: string }>(
    entity: keyof typeof db,
    id: string
  ): Promise<T | null> {
    await simulateDelay(200);
    const item = db[entity].find((i: any) => i.id === id);
    return item ? JSON.parse(JSON.stringify(item)) : null;
  },

  // Generic adder
  async addGeneric<T extends { id?: string }>(
    entity: keyof typeof db,
    data: Omit<T, 'id'>
  ): Promise<T> {
    await simulateDelay(300);
    // FIX: Explicitly convert `entity` to a string before calling .slice() to avoid type errors.
    const newItem = { ...data, id: `${String(entity).slice(0, -1)}-${Date.now()}` } as T;
    db[entity].push(newItem);
    return JSON.parse(JSON.stringify(newItem));
  },

  // Generic updater
  async updateGeneric<T extends { id: string }>(
    entity: keyof typeof db,
    data: T
  ): Promise<T> {
    await simulateDelay(300);
    const index = db[entity].findIndex((i: any) => i.id === data.id);
    if (index !== -1) {
      db[entity][index] = data;
      return JSON.parse(JSON.stringify(data));
    }
    // FIX: Explicitly convert `entity` to a string in the error message to handle symbols.
    throw new Error(`${String(entity)} not found with id ${data.id}`);
  },

  // Generic deleter
  async deleteGeneric(entity: keyof typeof db, id: string): Promise<{ id: string }> {
    await simulateDelay(300);
    const index = db[entity].findIndex((i: any) => i.id === id);
    if (index !== -1) {
      db[entity].splice(index, 1);
      return { id };
    }
    // FIX: Explicitly convert `entity` to a string in the error message to handle symbols.
    throw new Error(`${String(entity)} not found with id ${id}`);
  },

  // Specific methods
  async login(email: string): Promise<User | null> {
    await simulateDelay(500);
    const user = db.users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
    return user ? { ...user } : null;
  },

  async getContact(id: string, organizationId: string): Promise<Contact | null> {
    await simulateDelay(200);
    const contact = db.contacts.find((c: Contact) => c.id === id && c.organizationId === organizationId);
    return contact ? { ...contact } : null;
  },

  async deleteOrganization(id: string): Promise<{ id: string }> {
    await simulateDelay(500);
    const orgIndex = db.organizations.findIndex((o: Organization) => o.id === id);
    if (orgIndex > -1) {
      db.organizations.splice(orgIndex, 1);
      // Also delete associated users, contacts, etc.
      db.users = db.users.filter((u: User) => u.organizationId !== id);
      db.contacts = db.contacts.filter((c: Contact) => c.organizationId !== id);
      db.tasks = db.tasks.filter((t: Task) => t.organizationId !== id);
      db.leads = db.leads.filter((l: Lead) => l.organizationId !== id);
      return { id };
    }
    throw new Error('Organization not found');
  },
};

export { api };