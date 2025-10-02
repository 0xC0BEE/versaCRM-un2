
import React, { useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { Ticket, TicketStatus, TicketPriority } from '../../types';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useNotification } from '../../hooks/useNotification';
import Input from '../../components/ui/Input';

interface NewTicketFormProps {
    onTicketCreated: () => void;
}

const NewTicketForm: React.FC<NewTicketFormProps> = ({ onTicketCreated }) => {
    const { currentUser } = useAuth();
    const { useAddTicket, useAddTicketComment } = useData();
    const { addNotification } = useNotification();
    const addTicketMutation = useAddTicket();
    const addCommentMutation = useAddTicketComment();

    const [subject, setSubject] = useState('');
    const [comment, setComment] = useState('');

    const handleSubmit = () => {
        if (!subject.trim() || !comment.trim() || !currentUser?.contactId || !currentUser.organizationId) {
            addNotification("Please provide both a subject and a description for your issue.", "error");
            return;
        }

        addTicketMutation.mutate({
            organizationId: currentUser.organizationId,
            contactId: currentUser.contactId,
            subject,
            status: TicketStatus.Open,
            priority: TicketPriority.Medium,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            assignedToId: undefined,
        }, {
            onSuccess: (newTicket) => {
                // Add the initial comment to the new ticket
                addCommentMutation.mutate({
                    ticketId: newTicket.id,
                    authorId: currentUser.id,
                    content: comment,
                    createdAt: new Date().toISOString(),
                    isInternalNote: false
                });
                addNotification("Your ticket has been submitted successfully.", "success");
                onTicketCreated();
            },
            onError: () => {
                addNotification("There was an error submitting your ticket. Please try again.", "error");
            }
        });
    };

    const isLoading = addTicketMutation.isPending || addCommentMutation.isPending;

    return (
        <div className="space-y-4">
            <Input
                label="Subject"
                placeholder="e.g., Problem with my latest invoice"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
            />
            <div>
                 <label htmlFor="ticket-desc" className="block text-sm font-medium text-text-secondary mb-1">How can we help?</label>
                <textarea
                    id="ticket-desc"
                    rows={5}
                    placeholder="Please describe your issue in detail..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-2 border border-border-default rounded-lg bg-bg-card focus:ring-primary focus:outline-none"
                />
            </div>
            <Button onClick={handleSubmit} isLoading={isLoading}>
                Submit Ticket
            </Button>
        </div>
    );
};

const TicketsPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { useTickets } = useData();
    const { data: tickets, isLoading } = useTickets({ contactId: currentUser?.contactId });
    const [showNewTicketForm, setShowNewTicketForm] = useState(false);

    const getStatusColor = (status: TicketStatus) => {
        switch (status) {
            case TicketStatus.Open: return 'bg-blue-500/10 text-blue-500';
            case TicketStatus.InProgress: return 'bg-yellow-500/10 text-yellow-500';
            case TicketStatus.Closed: return 'bg-success/10 text-success';
            default: return 'bg-gray-500/10 text-gray-500';
        }
    };
    
    return (
        <Card
            title="My Support Tickets"
            actions={
                <Button onClick={() => setShowNewTicketForm(prev => !prev)}>
                    <Icon name="plus" /> {showNewTicketForm ? 'Cancel' : 'New Ticket'}
                </Button>
            }
        >
            {showNewTicketForm && (
                <div className="p-4 mb-4 border-b border-border-default">
                    <NewTicketForm onTicketCreated={() => setShowNewTicketForm(false)} />
                </div>
            )}
            {isLoading ? <Spinner /> : (
                <div className="overflow-x-auto -m-6">
                    <table className="min-w-full">
                        <thead className="bg-bg-default">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Subject</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Last Updated</th>
                            </tr>
                        </thead>
                        <tbody className="bg-bg-card divide-y divide-border-default">
                            {tickets?.map(ticket => (
                                <tr key={ticket.id} className="hover:bg-bg-default">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link to={`/client/tickets/${ticket.id}`} className="text-sm font-medium text-primary hover:underline">
                                            {ticket.subject}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                        {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {tickets?.length === 0 && !showNewTicketForm && <p className="text-center p-8 text-text-secondary">You have not submitted any tickets.</p>}
                </div>
            )}
        </Card>
    );
};

export default TicketsPage;
