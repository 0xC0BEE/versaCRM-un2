
import React from 'react';
import { Contact, ActivityType } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useNotification } from '../../hooks/useNotification';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface EmailTabProps {
  contact: Contact;
}

const EmailTab: React.FC<EmailTabProps> = ({ contact }) => {
    const { currentUser } = useAuth();
    const { useAddActivity } = useData();
    const addActivity = useAddActivity();
    const { addNotification } = useNotification();

    const handleSendEmail = () => {
        // This is a mock. In a real app, this would use an email API.
        const subjectEl = document.getElementById('email-subject') as HTMLInputElement;
        const bodyEl = document.getElementById('email-body') as HTMLTextAreaElement;
        
        const subject = subjectEl.value;
        const body = bodyEl.value;

        if (!subject || !body) {
            addNotification('Please fill out both subject and body.', 'error');
            return;
        }

        addActivity.mutate({
            contactId: contact.id,
            organizationId: contact.organizationId,
            type: ActivityType.Email,
            content: `Sent email with subject: "${subject}"`,
            createdAt: new Date().toISOString(),
            createdBy: currentUser!.id,
        }, {
            onSuccess: () => {
                addNotification('Mock email sent and logged to activity!', 'success');
                subjectEl.value = '';
                bodyEl.value = '';
            },
            onError: () => {
                 addNotification('Failed to log email activity.', 'error');
            }
        });
    };

    return (
        <Card title="Compose Email">
            <div className="space-y-4">
                <Input label="To" value={contact.email} readOnly />
                <Input label="Subject" id="email-subject" placeholder="Email subject" />
                <textarea
                    id="email-body"
                    rows={8}
                    className="w-full p-2 border border-border-default rounded-lg bg-bg-card focus:ring-primary focus:outline-none"
                    placeholder="Write your email here..."
                />
                <Button onClick={handleSendEmail} isLoading={addActivity.isPending}>
                    Send Email (Mock)
                </Button>
            </div>
        </Card>
    );
};

export default EmailTab;
