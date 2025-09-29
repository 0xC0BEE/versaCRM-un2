import { UserRole, Industry, IndustryConfig, CustomFieldType } from './types';

export const SIDEBAR_LINKS: Record<UserRole, { name: string; path: string; icon: string }[]> = {
  [UserRole.SuperAdmin]: [
    { name: 'Dashboard', path: '/superadmin/dashboard', icon: 'dashboard' },
    { name: 'Organizations', path: '/superadmin/organizations', icon: 'building' },
    { name: 'Industries', path: '/superadmin/industries', icon: 'settings' },
  ],
  [UserRole.OrgAdmin]: [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Contacts', path: '/contacts', icon: 'users' }, // Name will be replaced dynamically
    { name: 'Deals', path: '/deals', icon: 'zap' },
    { name: 'Team', path: '/team', icon: 'briefcase' },
    { name: 'Reports', path: '/reports', icon: 'chart' },
    { name: 'Settings', path: '/settings', icon: 'settings' },
  ],
  [UserRole.TeamMember]: [
    { name: 'My Tasks', path: '/team-member', icon: 'clipboard' },
    { name: 'Contacts', path: '/contacts', icon: 'users' },
  ],
  [UserRole.Client]: [
    { name: 'AI Assistant', path: '/client/ai-assistant', icon: 'bot' },
    { name: 'Billing', path: '/client/billing', icon: 'creditCard' },
  ],
};

export const INITIAL_INDUSTRY_CONFIG: Record<Industry, IndustryConfig> = {
    [Industry.Healthcare]: {
        label: 'Healthcare',
        icon: '❤️',
        contactLabel: 'Patients',
        fieldLabels: {
            primaryId: 'Patient ID',
            assignedToId: 'Primary Care Physician'
        },
        schema: [
            { name: 'allergies', label: 'Allergies', type: CustomFieldType.Text, required: true },
            { name: 'conditions', label: 'Chronic Conditions', type: CustomFieldType.Text },
            { name: 'careLevel', label: 'Care Level', type: CustomFieldType.Dropdown, options: ['Beginner', 'Intermediate', 'Advanced'] },
            { name: 'lastCheckup', label: 'Last Checkup Date', type: CustomFieldType.Date },
        ]
    },
    [Industry.Education]: {
        label: 'Education',
        icon: '🎓',
        contactLabel: 'Students',
        fieldLabels: {
            primaryId: 'Student ID',
            assignedToId: 'Academic Advisor'
        },
        schema: [
            { name: 'major', label: 'Major', type: CustomFieldType.Text, required: true },
            { name: 'gpa', label: 'GPA', type: CustomFieldType.Number },
            { name: 'enrollmentStatus', label: 'Enrollment Status', type: CustomFieldType.Dropdown, options: ['Enrolled', 'Withdrawn', 'Graduated'] },
            { name: 'studentPhoto', label: 'Student Photo', type: CustomFieldType.File },
        ]
    },
    [Industry.Retail]: {
        label: 'Retail',
        icon: '🛒',
        contactLabel: 'Customers',
        fieldLabels: {
            primaryId: 'Customer ID',
            assignedToId: 'Account Manager'
        },
        schema: [
            // Retail has no custom fields by default in mock data
        ]
    }
};