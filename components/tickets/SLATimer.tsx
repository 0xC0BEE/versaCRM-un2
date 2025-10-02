import React, { useState, useEffect } from 'react';
import { Ticket, TicketStatus } from '../../types';
import { differenceInMilliseconds, formatDistanceToNow } from 'date-fns';
import Icon from '../ui/Icon';

interface SLATimerProps {
    ticket: Ticket;
}

const SLATimer: React.FC<SLATimerProps> = ({ ticket }) => {
    const [, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    if (ticket.status === TicketStatus.Closed || ticket.firstRespondedAt) {
        let statusText = 'Met';
        let color = 'text-success';

        if (ticket.firstRespondedAt && ticket.slaDueAt) {
            if (new Date(ticket.firstRespondedAt) > new Date(ticket.slaDueAt)) {
                statusText = 'Breached';
                color = 'text-danger';
            }
        } else if (ticket.status === TicketStatus.Closed) {
            statusText = 'N/A';
            color = 'text-text-secondary';
        }
        
        return <span className={`text-sm font-semibold ${color}`}>{statusText}</span>;
    }
    
    if (!ticket.slaDueAt) {
        return <span className="text-sm text-text-secondary">-</span>;
    }

    const dueDate = new Date(ticket.slaDueAt);
    const now = new Date();
    const diff = differenceInMilliseconds(dueDate, now);

    if (diff <= 0) {
        return <span className="text-sm font-semibold text-danger flex items-center gap-1"><Icon name="hourglass" className="w-4 h-4" /> Breached</span>;
    }

    const totalDuration = differenceInMilliseconds(dueDate, new Date(ticket.createdAt));
    const isAtRisk = diff / totalDuration < 0.25; // Less than 25% of time remaining

    const color = isAtRisk ? 'text-yellow-500' : 'text-text-secondary';

    return (
        <span className={`flex items-center gap-1 ${color}`}>
            <Icon name="hourglass" className="w-4 h-4" />
            {formatDistanceToNow(dueDate, { addSuffix: true })}
        </span>
    );
};

export default SLATimer;