import { User, Organization, Contact, Task, Lead, Workflow, Activity, Alert, Order, UserRole, Industry, ContactStatus, WorkflowTrigger, WorkflowAction, LeadStage, ActivityType, OrderStatus, EmailTemplate, Sequence, SequenceEnrollment, SequenceStepType, EnrollmentStatus, DashboardWidget, Document, DirectMessage, WorkflowNodeType, LeadScoringRule, LeadScoringAttribute, KnowledgeBaseArticle, Ticket, TicketComment, TicketStatus, TicketPriority, SLAPolicy } from '../types';

const ORG_HEALTHCARE_ID = 'org-1';
const ORG_EDUCATION_ID = 'org-2';
const ORG_RETAIL_ID = 'org-3';

export const mockOrganizations: Organization[] = [
  { id: ORG_HEALTHCARE_ID, name: 'General Hospital', industry: Industry.Healthcare, contactCount: 2, createdAt: new Date(2023, 5, 15).toISOString() },
  { id: ORG_EDUCATION_ID, name: 'State University', industry: Industry.Education, contactCount: 1, createdAt: new Date(2023, 8, 20).toISOString() },
  { id: ORG_RETAIL_ID, name: 'SuperMart', industry: Industry.Retail, contactCount: 1, createdAt: new Date(2023, 1, 10).toISOString() },
];

export const mockUsers: User[] = [
  // Super Admin
  { id: 'user-0', name: 'Sam Super', email: 'super@versacrm.com', role: UserRole.SuperAdmin, organizationId: '', avatarUrl: 'https://i.pravatar.cc/150?u=user-0' },

  // Healthcare Org
  { id: 'user-1', name: 'Alice Admin', email: 'admin@generalhospital.com', role: UserRole.OrgAdmin, organizationId: ORG_HEALTHCARE_ID, avatarUrl: 'https://i.pravatar.cc/150?u=user-1' },
  { id: 'user-2', name: 'Bob Team', email: 'team@generalhospital.com', role: UserRole.TeamMember, organizationId: ORG_HEALTHCARE_ID, avatarUrl: 'https://i.pravatar.cc/150?u=user-2' },
  { id: 'user-3', name: 'Carol Client', email: 'client@patient.com', role: UserRole.Client, organizationId: ORG_HEALTHCARE_ID, contactId: 'contact-1', avatarUrl: 'https://i.pravatar.cc/150?u=user-3' },

  // Education Org
  { id: 'user-4', name: 'David Dean', email: 'admin@stateu.edu', role: UserRole.OrgAdmin, organizationId: ORG_EDUCATION_ID, avatarUrl: 'https://i.pravatar.cc/150?u=user-4' },
  { id: 'user-5', name: 'Eve Advisor', email: 'team@stateu.edu', role: UserRole.TeamMember, organizationId: ORG_EDUCATION_ID, avatarUrl: 'https://i.pravatar.cc/150?u=user-5' },
];

export const mockContacts: Contact[] = [
  { 
    id: 'contact-1', name: 'John Smith', email: 'john.smith@example.com', phone: '555-1234', organizationId: ORG_HEALTHCARE_ID, status: ContactStatus.Active, createdAt: new Date(2023, 6, 1).toISOString(), lastContacted: new Date(2024, 5, 20).toISOString(), assignedToId: 'user-2', primaryId: 'PAT-001',
    billingInfo: { accountBalance: 150.00, paymentMethod: 'Credit Card', nextBillingDate: new Date(2024, 6, 15).toISOString() },
    address: { street: '123 Main St', city: 'Anytown', state: 'CA', zip: '12345', country: 'USA' },
    emergencyContact: { firstName: 'Jane', lastName: 'Smith', phone: '555-5678' },
    insurance: { provider: 'Blue Shield', policyNumber: 'XYZ-987', status: 'Active' },
    customFields: { 
        allergies: 'Peanuts', 
        conditions: 'Hypertension',
        careLevel: 'Intermediate',
        lastCheckup: '2024-03-10',
    },
    lifecycleStage: 'Customer', leadSource: 'Referral', tags: ['VIP'], score: 0
  },
  { 
    id: 'contact-2', name: 'Emily Jones', email: 'emily.jones@example.com', phone: '555-4321', organizationId: ORG_HEALTHCARE_ID, status: ContactStatus.Inactive, createdAt: new Date(2023, 7, 10).toISOString(), lastContacted: new Date(2024, 3, 1).toISOString(), assignedToId: 'user-2', primaryId: 'PAT-002',
    // FIX: Changed nextBillingDate from '' to null to match type definition.
    billingInfo: { accountBalance: 0, paymentMethod: 'Unspecified', nextBillingDate: null },
    address: { street: '456 Oak Ave', city: 'Anytown', state: 'CA', zip: '12345', country: 'USA' },
    customFields: {
        allergies: 'None',
        conditions: 'None',
        careLevel: 'Beginner',
        lastCheckup: '2024-01-20',
    },
    lifecycleStage: 'Customer', leadSource: 'Website', tags: [], score: 0
  },
  {
    id: 'contact-3', name: 'Mike Student', email: 'mike.student@example.com', phone: '555-9999', organizationId: ORG_EDUCATION_ID, status: ContactStatus.Active, createdAt: new Date(2023, 9, 5).toISOString(), lastContacted: new Date(2024, 5, 18).toISOString(), assignedToId: 'user-5', primaryId: 'STU-101',
    billingInfo: { accountBalance: 2500.00, paymentMethod: 'Bank Transfer', nextBillingDate: new Date(2024, 8, 1).toISOString() },
    address: { street: '789 College Rd', city: 'Someville', state: 'NY', zip: '54321', country: 'USA' },
    customFields: {
        major: 'Computer Science',
        gpa: 3.8,
        enrollmentStatus: 'Enrolled',
        studentPhoto: [
            { id: 'file-1', name: 'student_photo.jpg', url: '#' }
        ],
    },
    lifecycleStage: 'Customer', leadSource: 'Website', tags: ['Dean\'s List'], score: 0
  },
   { 
    id: 'contact-4', name: 'Susan Shopper', email: 'susan.shopper@example.com', phone: '555-8888', organizationId: ORG_RETAIL_ID, status: ContactStatus.Active, createdAt: new Date(2023, 2, 1).toISOString(), lastContacted: new Date(2024, 5, 20).toISOString(), assignedToId: 'user-1', primaryId: 'CUST-001',
    // FIX: Changed nextBillingDate from '' to null to match type definition.
    billingInfo: { accountBalance: 25.00, paymentMethod: 'Credit Card', nextBillingDate: null },
    address: { street: '1 Retail Row', city: 'Shopburg', state: 'TX', zip: '78901', country: 'USA' },
    customFields: {},
    lifecycleStage: 'Customer', leadSource: 'Social Media', tags: ['Loyalty Gold'], score: 0
  },
];

export const mockTasks: Task[] = [
    { id: 'task-1', title: 'Follow up with John Smith', completed: false, dueDate: new Date(2024, 6, 1).toISOString(), organizationId: ORG_HEALTHCARE_ID, assignedTo: 'user-2', contactId: 'contact-1', sharedWithClient: true },
    { id: 'task-2', title: 'Review Mike Student\'s application', completed: true, dueDate: new Date(2024, 5, 15).toISOString(), organizationId: ORG_EDUCATION_ID, assignedTo: 'user-5', contactId: 'contact-3', sharedWithClient: false },
    { id: 'task-3', title: 'Prepare quarterly report', completed: false, dueDate: new Date(2024, 6, 5).toISOString(), organizationId: ORG_HEALTHCARE_ID, assignedTo: 'user-1', contactId: '', sharedWithClient: false },
    { id: 'task-4', title: 'Upload latest test results', completed: false, dueDate: new Date(2024, 6, 2).toISOString(), organizationId: ORG_HEALTHCARE_ID, assignedTo: 'user-2', contactId: 'contact-1', sharedWithClient: true },

];

export const mockLeads: Lead[] = [
    { id: 'lead-1', name: 'Future Patient', email: 'future@example.com', organizationId: ORG_HEALTHCARE_ID, stage: LeadStage.New, value: 5000, source: 'Website', createdAt: new Date().toISOString() },
    { id: 'lead-2', name: 'Potential Student', email: 'potential@example.com', organizationId: ORG_EDUCATION_ID, stage: LeadStage.Qualified, value: 20000, source: 'Referral', assignedToId: 'user-5', createdAt: new Date().toISOString() },
    { id: 'lead-3', name: 'Big Spender', email: 'spender@example.com', organizationId: ORG_RETAIL_ID, stage: LeadStage.Proposal, value: 150000, source: 'Referral', createdAt: new Date().toISOString() },
];

export const mockWorkflows: Workflow[] = [
  { 
    id: 'wf-1', 
    name: 'New Patient Onboarding', 
    organizationId: ORG_HEALTHCARE_ID,
    nodes: [
      { id: 'node-1', type: WorkflowNodeType.Trigger, nodeType: WorkflowTrigger.NewContactCreated, position: { x: 50, y: 150 }, data: {} },
      { id: 'node-2', type: WorkflowNodeType.Action, nodeType: WorkflowAction.CreateTask, position: { x: 350, y: 100 }, data: { taskTitle: 'Onboarding', assignedToId: 'user-2' } },
      { id: 'node-3', type: WorkflowNodeType.Action, nodeType: WorkflowAction.SendEmail, position: { x: 350, y: 200 }, data: { templateId: 'et-1' } }
    ],
    edges: [
      { id: 'edge-1', source: 'node-1', target: 'node-2' },
      { id: 'edge-2', source: 'node-1', target: 'node-3' }
    ]
  },
  { 
    id: 'wf-2', 
    name: 'status change', 
    organizationId: ORG_HEALTHCARE_ID,
    trigger: WorkflowTrigger.ContactStatusChanges,
    triggerCondition: { newStatus: 'Active' },
    action: WorkflowAction.CreateTask,
    actionDetails: { taskTitle: 'Perform follow-up check' },
    nodes: [],
    edges: []
  },
];

export const mockActivities: Activity[] = [
    { id: 'act-1', contactId: 'contact-1', organizationId: ORG_HEALTHCARE_ID, type: ActivityType.Note, content: 'Patient reported feeling better.', createdAt: new Date(2024, 5, 20, 10, 0, 0).toISOString(), createdBy: 'user-2' },
    { id: 'act-2', contactId: 'contact-1', organizationId: ORG_HEALTHCARE_ID, type: ActivityType.Call, content: 'Called to confirm next appointment.', createdAt: new Date(2024, 5, 18, 14, 30, 0).toISOString(), createdBy: 'user-2' },
];

export const mockAlerts: Alert[] = [
    { id: 'alert-1', userId: 'user-2', message: 'A new task "Follow up with John Smith" was assigned to you.', read: false, createdAt: new Date(2024, 5, 25).toISOString(), linkTo: '/contacts/contact-1' },
];

export const mockOrders: Order[] = [
    { id: 'order-1', contactId: 'contact-1', organizationId: ORG_HEALTHCARE_ID, total: 200, orderDate: new Date(2024, 4, 15).toISOString(), status: OrderStatus.Paid },
    { id: 'order-2', contactId: 'contact-1', organizationId: ORG_HEALTHCARE_ID, total: 150, orderDate: new Date(2024, 5, 15).toISOString(), status: OrderStatus.Pending },
];

export const mockDocuments: Document[] = [
    { id: 'doc-1', contactId: 'contact-1', organizationId: ORG_HEALTHCARE_ID, name: 'Initial_Consultation_Notes.pdf', url: '#', uploadedAt: new Date(2024, 5, 1).toISOString(), uploadedById: 'user-2', sharedWithClient: true },
    { id: 'doc-2', contactId: 'contact-1', organizationId: ORG_HEALTHCARE_ID, name: 'Lab_Results_May_2024.pdf', url: '#', uploadedAt: new Date(2024, 5, 15).toISOString(), uploadedById: 'user-2', sharedWithClient: true },
    { id: 'doc-3', contactId: 'contact-1', organizationId: ORG_HEALTHCARE_ID, name: 'Internal_Review.docx', url: '#', uploadedAt: new Date(2024, 5, 16).toISOString(), uploadedById: 'user-1', sharedWithClient: false },
];

export const mockEmailTemplates: EmailTemplate[] = [
    { id: 'et-1', organizationId: ORG_HEALTHCARE_ID, name: 'Welcome Email', subject: 'Welcome to General Hospital!', body: 'Hello {{contact.name}},\n\nWe are pleased to welcome you.' },
    { id: 'et-2', organizationId: ORG_HEALTHCARE_ID, name: 'Follow-up Check', subject: 'Just checking in', body: 'Hi {{contact.name}},\n\nJust wanted to follow up on our last conversation.' },
];

export const mockSequences: Sequence[] = [
    { id: 'seq-1', organizationId: ORG_HEALTHCARE_ID, name: 'New Patient Welcome Sequence', steps: [
        { id: 'step-1-1', type: SequenceStepType.Email, emailTemplateId: 'et-1' },
        { id: 'step-1-2', type: SequenceStepType.Wait, delayDays: 3 },
        { id: 'step-1-3', type: SequenceStepType.Email, emailTemplateId: 'et-2' },
    ]},
];

export const mockSequenceEnrollments: SequenceEnrollment[] = [
    { id: 'enrl-1', contactId: 'contact-2', sequenceId: 'seq-1', status: EnrollmentStatus.Active, enrolledAt: new Date(2024, 5, 24).toISOString(), currentStep: 1, nextStepDate: new Date(2024, 5, 27).toISOString() },
];

export const mockDirectMessages: DirectMessage[] = [
    { id: 'dm-1', contactId: 'contact-1', organizationId: ORG_HEALTHCARE_ID, senderId: 'user-2', receiverId: 'user-3', content: 'Hi Carol, just wanted to remind you about your appointment tomorrow at 10 AM.', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), read: true },
    { id: 'dm-2', contactId: 'contact-1', organizationId: ORG_HEALTHCARE_ID, senderId: 'user-3', receiverId: 'user-2', content: 'Thanks for the reminder, Bob! I\'ll be there.', createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), read: false },
];

export const mockLeadScoringRules: LeadScoringRule[] = [
    { id: 'lsr-1', organizationId: ORG_HEALTHCARE_ID, attribute: LeadScoringAttribute.LeadSource, value: 'Referral', points: 20 },
    { id: 'lsr-2', organizationId: ORG_HEALTHCARE_ID, attribute: LeadScoringAttribute.LeadSource, value: 'Website', points: 10 },
    { id: 'lsr-3', organizationId: ORG_HEALTHCARE_ID, attribute: LeadScoringAttribute.Tag, value: 'VIP', points: 50 },
];

export const mockKnowledgeBaseArticles: KnowledgeBaseArticle[] = [
    { id: 'kb-1', organizationId: ORG_HEALTHCARE_ID, title: 'Billing and Payments', content: 'You can view your current balance and payment history in the "Billing" section of your portal. We accept credit card and bank transfer payments.', createdAt: new Date().toISOString() },
    { id: 'kb-2', organizationId: ORG_HEALTHCARE_ID, title: 'How to Book an Appointment', content: 'To book a new appointment, please send a message to your assigned physician through the "Messages" tab in your portal. They will assist you with scheduling.', createdAt: new Date().toISOString() },
];

export const mockSLAPolicies: SLAPolicy[] = [
    { id: 'sla-1', organizationId: ORG_HEALTHCARE_ID, priority: TicketPriority.High, responseTimeHours: 1 },
    { id: 'sla-2', organizationId: ORG_HEALTHCARE_ID, priority: TicketPriority.Medium, responseTimeHours: 4 },
    { id: 'sla-3', organizationId: ORG_HEALTHCARE_ID, priority: TicketPriority.Low, responseTimeHours: 24 },
];

export const mockTickets: Ticket[] = [
    { id: 'ticket-1', organizationId: ORG_HEALTHCARE_ID, contactId: 'contact-1', subject: 'Issue with my last bill', status: TicketStatus.Open, priority: TicketPriority.High, createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), assignedToId: 'user-1' },
    { id: 'ticket-2', organizationId: ORG_HEALTHCARE_ID, contactId: 'contact-2', subject: 'How do I reschedule my appointment?', status: TicketStatus.InProgress, priority: TicketPriority.Medium, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), assignedToId: 'user-2' },
];

export const mockTicketComments: TicketComment[] = [
    { id: 'tc-1', ticketId: 'ticket-1', authorId: 'user-3', content: 'I believe there is an error on my last invoice. Can someone please look into it?', createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), isInternalNote: false },
    { id: 'tc-2', ticketId: 'ticket-1', authorId: 'user-1', content: 'Hi Carol, I\'m looking into this for you now and will get back to you shortly.', createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(), isInternalNote: false },
    { id: 'tc-3', ticketId: 'ticket-1', authorId: 'user-1', content: 'Note to self: check payment processor logs for a duplicate charge on the 15th.', createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(), isInternalNote: true },
];

export const mockDashboardWidgets: DashboardWidget[] = [];

export const MOCK_DB = {
    organizations: mockOrganizations,
    users: mockUsers,
    contacts: mockContacts,
    tasks: mockTasks,
    leads: mockLeads,
    workflows: mockWorkflows,
    activities: mockActivities,
    alerts: mockAlerts,
    orders: mockOrders,
    documents: mockDocuments,
    emailTemplates: mockEmailTemplates,
    sequences: mockSequences,
    sequenceEnrollments: mockSequenceEnrollments,
    dashboardWidgets: mockDashboardWidgets,
    directMessages: mockDirectMessages,
    leadScoringRules: mockLeadScoringRules,
    knowledgeBaseArticles: mockKnowledgeBaseArticles,
    tickets: mockTickets,
    ticketComments: mockTicketComments,
    slaPolicies: mockSLAPolicies,
};