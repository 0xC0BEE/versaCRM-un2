
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../../hooks/useData';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import TicketCommentThread from '../../components/tickets/TicketCommentThread';
import Icon from '../../components/ui/Icon';
import { TicketStatus } from '../../types';

const TicketDetailPage: React.FC = () => {
    const { ticketId } = useParams<{ ticketId: string }>();
    const { useTicket } = useData();

    const { data: ticket, isLoading } = useTicket(ticketId);

    if (isLoading) return <Spinner />;

    if (!ticket) {
        return <div className="text-center p-8">Ticket not found.</div>;
    }

    const getStatusColor = (status: TicketStatus) => {
        switch (status) {
            case TicketStatus.Open: return 'bg-blue-500/10 text-blue-500';
            case TicketStatus.InProgress: return 'bg-yellow-500/10 text-yellow-500';
            case TicketStatus.Closed: return 'bg-success/10 text-success';
            default: return 'bg-gray-500/10 text-gray-500';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                 <Link to="/client/tickets" className="text-sm text-primary hover:underline flex items-center gap-1 mb-2">
                    <Icon name="chevronDown" className="-rotate-90 w-4 h-4" /> Back to Tickets
                </Link>
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-text-default">{ticket.subject}</h1>
                     <span className={`px-2.5 py-1 text-sm font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                    </span>
                </div>
                 <p className="text-text-secondary mt-1">Ticket ID: {ticket.id}</p>
            </div>

            <Card>
                <TicketCommentThread ticket={ticket} />
            </Card>
        </div>
    );
};

export default TicketDetailPage;
