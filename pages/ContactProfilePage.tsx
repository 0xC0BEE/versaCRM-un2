import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { useIndustryConfig } from '../hooks/useIndustryConfig';
import { useNotification } from '../hooks/useNotification';
import { useUnsavedChangesWarning } from '../hooks/useUnsavedChangesWarning';
import { Contact, UploadedFile, ContactStatus } from '../types';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import CriticalInfoCard from '../components/profile/CriticalInfoCard';
import AssignedToCard from '../components/profile/AssignedToCard';
import BillingInfoCard from '../components/profile/BillingInfoCard';
import ActivityTimeline from '../components/profile/ActivityTimeline';
import EmailTab from '../components/profile/EmailTab';
import TasksTab from '../components/profile/TasksTab';
import Select from '../components/ui/Select';

const ContactProfilePage: React.FC = () => {
    const { contactId } = useParams<{ contactId: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { useContact, useUpdateContact, useTeamMembers } = useData();
    const industryConfig = useIndustryConfig();
    const { addNotification } = useNotification();

    const { data: contact, isLoading, error } = useContact(contactId, currentUser?.organizationId);
    const { data: teamMembers } = useTeamMembers(currentUser?.organizationId);
    const updateContactMutation = useUpdateContact();

    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState<Contact | null>(null);
    const [activeTab, setActiveTab] = useState('activity');

    const isDirty = useMemo(() => {
        if (!contact || !formData) return false;
        return JSON.stringify(contact) !== JSON.stringify(formData);
    }, [contact, formData]);

    useUnsavedChangesWarning(isDirty && isEditMode);

    useEffect(() => {
        if (contact) {
            setFormData(JSON.parse(JSON.stringify(contact))); // Deep copy
        }
    }, [contact]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (!formData) return;
        
        // Handle nested properties
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData({
                ...formData,
                [parent]: {
                    ...(formData[parent as keyof Contact] as object),
                    [child]: value
                }
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };
    
    const handleCustomFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const fieldName = name.split('.')[1];
        if (!formData) return;
        
        const newFormData = { ...formData, customFields: { ...formData.customFields } };

        if ((e.target as HTMLInputElement).type === 'file') {
            const files = (e.target as HTMLInputElement).files;
            if (files) {
                const newFiles = Array.from(files).map(f => ({ id: `file-${Date.now()}-${f.name}`, name: f.name, url: '#' }));
                newFormData.customFields[fieldName] = [...(newFormData.customFields[fieldName] || []), ...newFiles];
            }
        } else {
            newFormData.customFields[fieldName] = value;
        }
        setFormData(newFormData);
    };

    const handleRemoveFile = (fieldName: string, fileId: string) => {
        if (!formData) return;
        const newFormData = { ...formData, customFields: { ...formData.customFields } };
        const currentFiles = newFormData.customFields[fieldName] as UploadedFile[];
        newFormData.customFields[fieldName] = currentFiles.filter(f => f.id !== fileId);
        setFormData(newFormData);
    };

    const handleSave = () => {
        if (!formData) return;
        updateContactMutation.mutate(formData, {
            onSuccess: () => {
                addNotification(`${industryConfig?.contactLabel.slice(0, -1)} updated successfully!`, 'success');
                setIsEditMode(false);
            },
            onError: (err) => {
                addNotification(`Error updating: ${err.message}`, 'error');
            }
        });
    };

    const handleCancel = () => {
        if (contact) {
            setFormData(JSON.parse(JSON.stringify(contact)));
        }
        setIsEditMode(false);
    };

    if (isLoading || !industryConfig) return <Spinner />;
    if (error || !contact || !formData) return <div className="text-center p-8">Contact not found.</div>;

    const tabs = [
        { id: 'activity', label: 'Activity' },
        { id: 'tasks', label: 'Tasks' },
        { id: 'email', label: 'Email' },
    ];
    
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-text-default flex items-center gap-3">
                        {contact.name}
                        {isEditMode ? (
                            <Select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="text-sm !py-1 !px-2 w-32"
                            >
                                {Object.values(ContactStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </Select>
                        ) : (
                            <span className={`px-2.5 py-0.5 text-sm font-semibold rounded-full ${contact.status === 'Active' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                                {contact.status}
                            </span>
                        )}
                    </h1>
                    <p className="text-text-secondary">{contact.email}</p>
                </div>
                <div className="flex gap-2">
                    {isEditMode ? (
                        <>
                            <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
                            <Button onClick={handleSave} isLoading={updateContactMutation.isPending} disabled={!isDirty}>Save Changes</Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditMode(true)}><Icon name="edit"/> Edit</Button>
                    )}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <CriticalInfoCard 
                        patient={formData}
                        isEditMode={isEditMode}
                        onInputChange={handleInputChange}
                        onCustomFieldChange={handleCustomFieldChange}
                        onRemoveFile={handleRemoveFile}
                        industryConfig={industryConfig}
                    />
                </div>
                <div className="space-y-6">
                    <AssignedToCard 
                        patient={formData}
                        teamMembers={teamMembers || []}
                        isEditMode={isEditMode}
                        onInputChange={handleInputChange}
                        industryConfig={industryConfig}
                    />
                    <BillingInfoCard 
                        patient={formData}
                        isEditMode={isEditMode}
                        onInputChange={handleInputChange}
                    />
                </div>
            </div>
            
            {/* Tabs */}
            <div>
                 <div className="border-b border-border-default mb-6">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-text-secondary hover:text-text-default hover:border-border-default'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div>
                    {activeTab === 'activity' && <ActivityTimeline contact={contact} />}
                    {activeTab === 'tasks' && <TasksTab contact={contact} teamMembers={teamMembers || []} />}
                    {activeTab === 'email' && <EmailTab contact={contact} />}
                </div>
            </div>
        </div>
    );
};

export default ContactProfilePage;