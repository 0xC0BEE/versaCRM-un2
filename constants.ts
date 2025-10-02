import { UserRole, Industry, CustomFieldType, IndustryConfig } from './types';

export const SIDEBAR_LINKS = {
  [UserRole.SuperAdmin]: [
    { name: 'Dashboard', path: '/superadmin/dashboard', icon: 'dashboard' },
    { name: 'Organizations', path: '/superadmin/organizations', icon: 'building' },
    { name: 'Industries', path: '/superadmin/industries', icon: 'settings' },
  ],
  [UserRole.OrgAdmin]: [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'My Tasks', path: '/my-tasks', icon: 'clipboard' },
    { name: 'Contacts', path: '/contacts', icon: 'users' },
    { name: 'Deals', path: '/deals', icon: 'zap' },
    { name: 'Tickets', path: '/tickets', icon: 'ticket' },
    { name: 'Sequences', path: '/sequences', icon: 'mail' },
    { name: 'Team', path: '/team', icon: 'briefcase' },
    { name: 'Reports', path: '/reports', icon: 'chart' },
    { name: 'Settings', path: '/settings', icon: 'settings' },
  ],
  [UserRole.TeamMember]: [
    { name: 'My Tasks', path: '/my-tasks', icon: 'clipboard' },
    { name: 'Contacts', path: '/contacts', icon: 'users' },
    { name: 'Tickets', path: '/tickets', icon: 'ticket' },
  ],
  [UserRole.Client]: [
    { name: 'AI Assistant', path: '/client/ai-assistant', icon: 'bot' },
    { name: 'My Tickets', path: '/client/tickets', icon: 'ticket' },
    { name: 'Messages', path: '/client/messages', icon: 'message' },
    { name: 'Tasks', path: '/client/tasks', icon: 'clipboard' },
    { name: 'Documents', path: '/client/documents', icon: 'file' },
    { name: 'Billing', path: '/client/billing', icon: 'creditCard' },
  ],
};

export const INITIAL_INDUSTRY_CONFIG: Record<Industry, IndustryConfig> = {
  [Industry.Healthcare]: {
    label: 'Healthcare',
    icon: '🏥',
    contactLabel: 'Patients',
    fieldLabels: {
      primaryId: 'Patient ID',
      assignedToId: 'Primary Physician',
    },
    schema: [
      { name: 'allergies', label: 'Allergies', type: CustomFieldType.Text, required: false },
      { name: 'conditions', label: 'Existing Conditions', type: CustomFieldType.Text, required: false },
      { name: 'careLevel', label: 'Care Level', type: CustomFieldType.Dropdown, options: ['Beginner', 'Intermediate', 'Advanced'], required: true },
      { name: 'lastCheckup', label: 'Last Checkup Date', type: CustomFieldType.Date, required: false },
    ],
  },
  [Industry.Education]: {
    label: 'Education',
    icon: '🎓',
    contactLabel: 'Students',
    fieldLabels: {
      primaryId: 'Student ID',
      assignedToId: 'Academic Advisor',
    },
    schema: [
      { name: 'major', label: 'Major', type: CustomFieldType.Text, required: true },
      { name: 'gpa', label: 'GPA', type: CustomFieldType.Number, required: false },
      { name: 'enrollmentStatus', label: 'Enrollment Status', type: CustomFieldType.Dropdown, options: ['Enrolled', 'Graduated', 'Withdrawn'], required: true },
      { name: 'studentPhoto', label: 'Student Photo', type: CustomFieldType.File, required: false },
    ],
  },
  [Industry.Retail]: {
    label: 'Retail',
    icon: '🛒',
    contactLabel: 'Customers',
    fieldLabels: {
      primaryId: 'Customer ID',
      assignedToId: 'Account Manager',
    },
    schema: [
        { name: 'lastPurchaseDate', label: 'Last Purchase Date', type: CustomFieldType.Date, required: false },
        { name: 'loyaltyTier', label: 'Loyalty Tier', type: CustomFieldType.Dropdown, options: ['Bronze', 'Silver', 'Gold'], required: false },
    ],
  },
};