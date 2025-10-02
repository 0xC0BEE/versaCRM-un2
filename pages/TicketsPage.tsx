import React, { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { Ticket, TicketStatus, TicketPriority, User, Contact } from '../types';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import { useDebounce } from '../hooks/useDebounce';
import SLATimer from '../components/tickets/SLATimer';

const TicketsPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { useTickets, useUsers, useContacts } = useData();

    const { data: tickets, isLoading: ticketsLoading } = useTickets({ organizationId: currentUser?.organizationId });
    const { data: users, isLoading: usersLoading } = useUsers({ organizationId: currentUser?.organizationId });
    const { data: contacts, isLoading: contactsLoading } = useContacts(currentUser?.organizationId);

    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const getName = (id?: string, type: 'user' | 'contact' = 'user') => {
        if (!id) return 'N/A';
        const source = type === 'user' ? users : contacts;
        return source?.find(item => item.id === id)?.name || 'Unknown';
    };

    const filteredTickets = useMemo(() => {
        if (!tickets) return [];
        return tickets.filter(ticket => {
            const statusMatch = statusFilter === 'all' || ticket.status === statusFilter;
            const priorityMatch = priorityFilter === 'all' || ticket.priority === priorityFilter;
            const searchMatch = debouncedSearchTerm === '' || ticket.subject.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
            return statusMatch && priorityMatch && searchMatch;
        });
    }, [tickets, statusFilter, priorityFilter, debouncedSearchTerm]);

    const getStatusColor = (status: TicketStatus) => {
        switch (status) {
            case TicketStatus.Open: return 'bg-blue-500/10 text-blue-500';
            case TicketStatus.InProgress: return 'bg-yellow-500/10 text-yellow-500';
            case TicketStatus.Closed: return 'bg-success/10 text-success';
            default: return 'bg-gray-500/10 text-gray-500';
        }
    };

    const getPriorityColor = (priority: TicketPriority) => {
        switch (priority) {
            case TicketPriority.High: return 'text-danger';
            case TicketPriority.Medium: return 'text-yellow-500';
            case TicketPriority.Low: return 'text-success';
            default: return 'text-text-secondary';
        }
    };

    if (ticketsLoading || usersLoading || contactsLoading) return <Spinner />;

    return (
        <Card title="Support Tickets">
            <div className="flex gap-4 mb-4">
                <Input
                    placeholder="Search by subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow"
                />
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">All Statuses</option>
                    {Object.values(TicketStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
                <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                    <option value="all">All Priorities</option>
                    {Object.values(TicketPriority).map(p => <option key={p} value={p}>{p}</option>)}
                </Select>
            </div>
            <div className="overflow-x-auto -m-6">
                <table className="min-w-full">
                    <thead className="bg-bg-default">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Subject</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Contact</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Priority</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">SLA</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Assigned To</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Last Updated</th>
                        </tr>
                    </thead>
                    <tbody className="bg-bg-card divide-y divide-border-default">
                        {filteredTickets.map(ticket => (
                            <tr key={ticket.id} className="hover:bg-bg-default">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Link to={`/tickets/${ticket.id}`} className="text-sm font-medium text-primary hover:underline">{ticket.subject}</Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{getName(ticket.contactId, 'contact')}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                                        {ticket.status}
                                    </span>
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <SLATimer ticket={ticket} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{getName(ticket.assignedToId, 'user')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {filteredTickets.length === 0 && <p className="text-center text-text-secondary py-8">No tickets match the current filters.</p>}
        </Card>
    );
};

export default TicketsPage;