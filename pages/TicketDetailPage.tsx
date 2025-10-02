import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/ui/Spinner';
import Card from '../components/ui/Card';
import { TicketStatus, TicketPriority } from '../types';
import Select from '../components/ui/Select';
import TicketCommentThread from '../components/tickets/TicketCommentThread';
import Icon from '../components/ui/Icon';

const TicketDetailPage: React.FC = () => {
    const { ticketId } = useParams<{ ticketId: string }>();
    const { currentUser } = useAuth();
    const { useTicket, useUpdateTicket, useTeamMembers, useContact } = useData();

    const { data: ticket, isLoading: ticketLoading } = useTicket(ticketId);
    const { data: teamMembers, isLoading: membersLoading } = useTeamMembers(currentUser?.organizationId);
    const { data: contact, isLoading: contactLoading } = useContact(ticket?.contactId, ticket?.organizationId);
    const updateTicketMutation = useUpdateTicket();

    const handlePropertyChange = (field: 'status' | 'priority' | 'assignedToId', value: string) => {
        if (ticket) {
            updateTicketMutation.mutate({ ...ticket, [field]: value });
        }
    };
    
    if (ticketLoading || membersLoading || contactLoading) return <Spinner />;

    if (!ticket) {
        return <div className="text-center p-8">Ticket not found.</div>;
    }
    
    const propertyCardClasses = "bg-bg-default border border-border-default rounded-lg p-4";

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                 <div>
                    <Link to="/tickets" className="text-sm text-primary hover:underline flex items-center gap-1 mb-2">
                        <Icon name="chevronDown" className="-rotate-90 w-4 h-4" /> Back to Tickets
                    </Link>
                    <h1 className="text-2xl font-bold text-text-default">Ticket #{ticketId?.split('-')[1]}: {ticket.subject}</h1>
                 </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <TicketCommentThread ticket={ticket} />
                </div>
                <div className="space-y-4">
                    <div className={propertyCardClasses}>
                        <label className="text-sm font-medium text-text-secondary">Status</label>
                        <Select value={ticket.status} onChange={(e) => handlePropertyChange('status', e.target.value)}>
                            {Object.values(TicketStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </Select>
                    </div>
                     <div className={propertyCardClasses}>
                        <label className="text-sm font-medium text-text-secondary">Priority</label>
                        <Select value={ticket.priority} onChange={(e) => handlePropertyChange('priority', e.target.value)}>
                             {Object.values(TicketPriority).map(p => <option key={p} value={p}>{p}</option>)}
                        </Select>
                    </div>
                     <div className={propertyCardClasses}>
                        <label className="text-sm font-medium text-text-secondary">Assignee</label>
                        <Select value={ticket.assignedToId || ''} onChange={(e) => handlePropertyChange('assignedToId', e.target.value)}>
                            <option value="">Unassigned</option>
                            {teamMembers?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </Select>
                    </div>
                     <div className={propertyCardClasses}>
                        <h4 className="text-sm font-medium text-text-secondary mb-2">Contact</h4>
                        <p className="font-semibold text-text-default">{contact?.name}</p>
                        <p className="text-sm text-text-secondary">{contact?.email}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetailPage;