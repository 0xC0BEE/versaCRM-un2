// FIX: Replaced the file content with proper type definitions and exports to fix circular dependency and module export errors.

// Enums
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

export enum CustomFieldType {
  Text = 'Text',
  Number = 'Number',
  Date = 'Date',
  Dropdown = 'Dropdown',
  File = 'File',
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

export enum ActivityType {
    Note = 'Note',
    Call = 'Call',
    Email = 'Email',
    Meeting = 'Meeting',
    SMS = 'SMS',
    Sequence = 'Sequence',
}

export enum OrderStatus {
    Pending = 'Pending',
    Paid = 'Paid',
    Cancelled = 'Cancelled',
}

export enum SequenceStepType {
    Email = 'Email',
    Wait = 'Wait',
}

export enum EnrollmentStatus {
    Active = 'Active',
    Paused = 'Paused',
    Completed = 'Completed',
    Unsubscribed = 'Unsubscribed',
}

export enum WorkflowNodeType {
    Trigger = 'Trigger',
    Action = 'Action',
    Condition = 'Condition',
}

export enum WorkflowTrigger {
    NewContactCreated = 'NewContactCreated',
    ContactStatusChanges = 'ContactStatusChanges',
}

export enum WorkflowAction {
    CreateTask = 'CreateTask',
    SendEmail = 'SendEmail',
    SendSMS = 'SendSMS',
    AssignContact = 'AssignContact',
}

export enum WorkflowConditionType {
    ContactHasTag = 'ContactHasTag',
    CheckLeadScore = 'CheckLeadScore',
}

export enum LeadScoringAttribute {
    LeadSource = 'leadSource',
    Tag = 'tag',
}

export enum TicketStatus {
    Open = 'Open',
    InProgress = 'In Progress',
    Closed = 'Closed',
}

export enum TicketPriority {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
}

// Interfaces and Types
export interface SLAPolicy {
    id: string;
    organizationId: string;
    priority: TicketPriority;
    responseTimeHours: number;
}

export interface UploadedFile {
    id: string;
    name: string;
    url: string;
}

export interface CustomField {
  name: string; // unique identifier
  label: string;
  type: CustomFieldType;
  required?: boolean;
  options?: string[]; // for dropdown
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

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  contactId?: string;
  avatarUrl?: string;
}

export interface Organization {
  id: string;
  name: string;
  industry: Industry;
  contactCount: number;
  createdAt: string;
}

export interface BillingInfo {
    accountBalance: number;
    paymentMethod: string;
    nextBillingDate: string | null;
}

export interface Address {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
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
  lifecycleStage: string;
  leadSource: string;
  tags: string[];
  billingInfo: BillingInfo;
  address: Address;
  score: number;
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
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string;
  organizationId: string;
  assignedTo: string;
  contactId: string;
  sharedWithClient: boolean;
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

export interface WorkflowNode {
    id: string;
    type: WorkflowNodeType;
    nodeType: WorkflowTrigger | WorkflowAction | WorkflowConditionType;
    position: { x: number; y: number };
    data: any;
}

export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: 'true' | 'false';
}

export interface Workflow {
  id: string;
  name: string;
  organizationId: string;
  // New structure
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  // Old structure for backwards compatibility
  trigger?: WorkflowTrigger;
  triggerCondition?: any;
  action?: WorkflowAction;
  actionDetails?: any;
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

export interface Document {
    id: string;
    contactId: string;
    organizationId: string;
    name: string;
    url: string;
    uploadedAt: string;
    uploadedById: string;
    sharedWithClient: boolean;
}

export interface EmailTemplate {
  id: string;
  organizationId: string;
  name: string;
  subject: string;
  body: string;
}

export interface SequenceStep {
    id: string;
    type: SequenceStepType;
    emailTemplateId?: string;
    delayDays?: number;
}

export interface Sequence {
  id: string;
  organizationId: string;
  name: string;
  steps: SequenceStep[];
}

export interface SequenceEnrollment {
  id: string;
  contactId: string;
  sequenceId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  currentStep: number;
  nextStepDate: string | null;
}

export type Metric = 'newContacts' | 'wonDealsValue' | 'leadCount' | 'slaAchievement';
export type Dimension = 'byTeamMember' | 'byLeadSource' | 'byStage';
export type ChartType = 'bar' | 'line' | 'pie';

export interface DashboardWidget {
  id: string;
  name: string;
  organizationId: string;
  metric: Metric;
  dimension: Dimension;
  chartType: ChartType;
}

export interface DirectMessage {
    id: string;
    contactId: string;
    organizationId: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: string;
    read: boolean;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export interface LeadScoringRule {
    id: string;
    organizationId: string;
    attribute: LeadScoringAttribute;
    value: string;
    points: number;
}

export interface KnowledgeBaseArticle {
    id: string;
    organizationId: string;
    title: string;
    content: string;
    createdAt: string;
}

export interface Ticket {
    id: string;
    organizationId: string;
    contactId: string;
    subject: string;
    status: TicketStatus;
    priority: TicketPriority;
    createdAt: string;
    updatedAt: string;
    assignedToId?: string;
    slaDueAt?: string;
    firstRespondedAt?: string;
}

export interface TicketComment {
    id: string;
    ticketId: string;
    authorId: string;
    content: string;
    createdAt: string;
    isInternalNote: boolean;
}

export type IconName =
  | 'dashboard' | 'users' | 'zap' | 'briefcase' | 'chart' | 'settings'
  | 'building' | 'clipboard' | 'bot' | 'creditCard' | 'search' | 'bell'
  | 'sun' | 'moon' | 'chevronDown' | 'logo' | 'menu' | 'close' | 'plus'
  | 'edit' | 'trash' | 'arrowUpRight' | 'logout' | 'mail' | 'sparkles'
  | 'file' | 'message' | 'tag' | 'phone' | 'star' | 'bookOpen' | 'ticket' | 'hourglass';