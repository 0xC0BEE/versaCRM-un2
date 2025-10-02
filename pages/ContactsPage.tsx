import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { useIndustryConfig } from '../hooks/useIndustryConfig';
import { Contact, ContactStatus } from '../types';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import Input from '../components/ui/Input';
import { Link } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import Pagination from '../components/ui/Pagination';
import ContactEditorModal from '../components/modals/ContactEditorModal';
import Select from '../components/ui/Select';

const ContactsPage: React.FC = () => {
    const { currentUser } = useAuth();
    const industryConfig = useIndustryConfig();
    const { useContacts, useTeamMembers } = useData();
    const { data: contacts, isLoading, error } = useContacts(currentUser?.organizationId);
    const { data: teamMembers } = useTeamMembers(currentUser?.organizationId);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const filteredContacts = useMemo(() => {
        if (!contacts) return [];
        return contacts.filter(contact => {
            const searchMatch = (
                contact.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                contact.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
            );
            const statusMatch = statusFilter === 'all' || contact.status === statusFilter;
            return searchMatch && statusMatch;
        });
    }, [contacts, debouncedSearchTerm, statusFilter]);
    
    const paginatedContacts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredContacts.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredContacts, currentPage, itemsPerPage]);

    const getAssigneeName = (id?: string) => {
        if (!id) return 'Unassigned';
        return teamMembers?.find(tm => tm.id === id)?.name || 'Unknown User';
    };

    const handleOpenAddModal = () => {
        setEditingContact(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (contact: Contact) => {
        setEditingContact(contact);
        setIsModalOpen(true);
    };

    if (isLoading || !industryConfig) return <Spinner />;
    if (error) return <p className="text-danger">Error loading contacts.</p>;

    return (
        <>
            <Card
                title={industryConfig.contactLabel}
                actions={<Button onClick={handleOpenAddModal}><Icon name="plus" /> Add {industryConfig.contactLabel.slice(0, -1)}</Button>}
            >
                <div className="flex gap-4 mb-4">
                    <Input 
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-grow"
                    />
                     <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">All Statuses</option>
                        <option value={ContactStatus.Active}>Active</option>
                        <option value={ContactStatus.Inactive}>Inactive</option>
                    </Select>
                </div>
                <div className="overflow-x-auto -m-6">
                    <table className="min-w-full">
                        <thead className="bg-bg-default">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Score</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">{industryConfig.fieldLabels.assignedToId}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Last Contacted</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-bg-card divide-y divide-border-default">
                            {paginatedContacts.map(contact => (
                                <tr key={contact.id} className="hover:bg-bg-default">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link to={`/contacts/${contact.id}`} className="text-sm font-medium text-primary hover:underline">{contact.name}</Link>
                                        <div className="text-sm text-text-secondary">{contact.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${contact.status === 'Active' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                                            {contact.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-text-default">{contact.score}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{getAssigneeName(contact.assignedToId)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{new Date(contact.lastContacted).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end items-center gap-2">
                                            <button onClick={() => handleOpenEditModal(contact)} className="p-1 text-secondary hover:text-primary"><Icon name="edit" /></button>
                                            <Link to={`/contacts/${contact.id}`} className="p-1 text-secondary hover:text-primary">
                                                View
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination 
                    currentPage={currentPage}
                    totalItems={filteredContacts.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            </Card>

            {isModalOpen && (
                <ContactEditorModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    contact={editingContact}
                />
            )}
        </>
    );
};

export default ContactsPage;