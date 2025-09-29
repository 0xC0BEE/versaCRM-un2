// types.ts

export enum UserRole {
  SuperAdmin = 'Super Admin',
  OrgAdmin = 'Organization Admin',
  TeamMember = 'Team Member',
  Client = 'Client',
}

export enum Industry {
  Healthcare = 'Healthcare',
  Education = 'Education',
  Retail = 'Retail',
}

export enum ContactStatus {
  Active = 'Active',
  Inactive = 'Inactive',
}

export enum LeadStage {
    New = 'New',
    Contacted = 'Contacted',
    Qualified = 'Qualified',
    Proposal = 'Proposal',
    Won = 'Won',
    Lost = 'Lost',
}

export enum WorkflowTrigger {
    NewContactCreated = 'NewContactCreated',
    ContactStatusChanges = 'ContactStatusChanges',
}

export enum WorkflowAction {
    CreateTask = 'CreateTask',
    SendEmail = 'SendEmail',
}

export enum ActivityType {
    Note = 'Note',
    Call = 'Call',
    Email = 'Email',
    Meeting = 'Meeting',
}

export enum OrderStatus {
    Paid = 'Paid',
    Pending = 'Pending',
    Cancelled = 'Cancelled',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  avatarUrl?: string;
  contactId?: string;
}

export interface Organization {
  id: string;
  name: string;
  industry: Industry;
  contactCount: number;
  createdAt: string;
}

export interface UploadedFile {
    id: string;
    name: string;
    url: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  organizationId: string;
  status: ContactStatus;
  createdAt: string;
  lastContacted: string;
  assignedToId?: string;
  primaryId?: string;
  billingInfo: {
    accountBalance: number;
    paymentMethod: string;
    nextBillingDate: string | null;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  emergencyContact?: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  insurance?: {
    provider: string;
    policyNumber: string;
    status: string;
  };
  customFields: Record<string, any>;
  lifecycleStage: string;
  leadSource: string;
  tags: string[];
}

export interface Task {
    id: string;
    title: string;
    completed: boolean;
    dueDate: string;
    organizationId: string;
    assignedTo: string;
    contactId: string;
}

export interface Lead {
    id: string;
    name: string;
    email: string;
    organizationId: string;
    stage: LeadStage;
    value: number;
    source: string;
    createdAt: string;
    assignedToId?: string;
}

export interface Workflow {
    id: string;
    name: string;
    organizationId: string;
    trigger: WorkflowTrigger;
    triggerCondition: any;
    action: WorkflowAction;
    actionDetails: any;
}

export interface Activity {
    id: string;
    contactId: string;
    organizationId: string;
    type: ActivityType;
    content: string;
    createdAt: string;
    createdBy: string;
}

export interface Alert {
    id: string;
    userId: string;
    message: string;
    read: boolean;
    createdAt: string;
    linkTo?: string;
}

export interface Order {
    id: string;
    contactId: string;
    organizationId: string;
    total: number;
    orderDate: string;
    status: OrderStatus;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export enum CustomFieldType {
    Text = 'Text',
    Number = 'Number',
    Date = 'Date',
    Dropdown = 'Dropdown',
    File = 'File',
}

export interface CustomField {
    name: string;
    label: string;
    type: CustomFieldType;
    options?: string[];
    required?: boolean;
}

export interface IndustryConfig {
    label: string;
    icon: string;
    contactLabel: string;
    fieldLabels: {
        primaryId: string;
        assignedToId: string;
    };
    schema: CustomField[];
}