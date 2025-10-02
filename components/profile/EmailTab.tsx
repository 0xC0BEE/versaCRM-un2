import React, { useState } from 'react';
import { Contact, ActivityType } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useNotification } from '../../hooks/useNotification';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import AIEmailAssistantModal from '../modals/AIEmailAssistantModal';

interface EmailTabProps {
  contact: Contact;
}

const EmailTab: React.FC<EmailTabProps> = ({ contact }) => {
    const { currentUser } = useAuth();
    const { useAddActivity } = useData();
    const addActivity = useAddActivity();
    const { addNotification } = useNotification();

    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [isAIAssistOpen, setIsAIAssistOpen] = useState(false);

    const handleSendEmail = () => {
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
                setSubject('');
                setBody('');
            },
            onError: () => {
                 addNotification('Failed to log email activity.', 'error');
            }
        });
    };

    const handleDraftGenerated = (generatedSubject: string, generatedBody: string) => {
        setSubject(generatedSubject);
        setBody(generatedBody);
    };

    return (
        <>
            <Card title="Compose Email">
                <div className="space-y-4">
                    <Input label="To" value={contact.email} readOnly />
                    <Input label="Subject" id="email-subject" placeholder="Email subject" value={subject} onChange={e => setSubject(e.target.value)} />
                    <textarea
                        id="email-body"
                        rows={8}
                        className="w-full p-2 border border-border-default rounded-lg bg-bg-card focus:ring-primary focus:outline-none"
                        placeholder="Write your email here..."
                        value={body}
                        onChange={e => setBody(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setIsAIAssistOpen(true)}>
                            <Icon name="sparkles" className="mr-2" />
                            AI Assist
                        </Button>
                        <Button onClick={handleSendEmail} isLoading={addActivity.isPending}>
                            Send Email (Mock)
                        </Button>
                    </div>
                </div>
            </Card>
            {isAIAssistOpen && (
                <AIEmailAssistantModal
                    isOpen={isAIAssistOpen}
                    onClose={() => setIsAIAssistOpen(false)}
                    contact={contact}
                    onDraftGenerated={handleDraftGenerated}
                />
            )}
        </>
    );
};

export default EmailTab;