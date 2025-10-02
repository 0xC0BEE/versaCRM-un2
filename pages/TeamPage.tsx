import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import InviteMemberModal from '../components/modals/InviteMemberModal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { User } from '../types';
import { Link, useNavigate } from 'react-router-dom';

const TeamPage: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { useTeamMembers, useDeleteUser } = useData();
    const { data: teamMembers, isLoading, error } = useTeamMembers(currentUser?.organizationId);
    const deleteUserMutation = useDeleteUser();

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const handleDeleteRequest = (user: User) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (selectedUser) {
            deleteUserMutation.mutate(selectedUser.id);
            setIsDeleteModalOpen(false);
        }
    };
    
    const handleRowClick = (userId: string) => {
        navigate(`/team/tasks/${userId}`);
    };

    if (isLoading) return <Spinner />;
    if (error) return <p className="text-danger">Error loading team members.</p>;

    return (
        <>
            <Card
                title="Team Members"
                actions={<Button onClick={() => setIsInviteModalOpen(true)}><Icon name="plus" /> Invite Member</Button>}
            >
                <div className="overflow-x-auto -m-6">
                    <table className="min-w-full">
                        <thead className="bg-bg-default">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Role</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-bg-card divide-y divide-border-default">
                            {teamMembers?.map(member => (
                                <tr key={member.id} onClick={() => handleRowClick(member.id)} className="hover:bg-bg-default cursor-pointer">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full" src={member.avatarUrl} alt="" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-text-default">{member.name}</div>
                                                <div className="text-sm text-text-secondary">{member.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{member.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                                        <button 
                                            onClick={() => handleDeleteRequest(member)}
                                            className="p-1 text-secondary hover:text-danger"
                                            disabled={member.id === currentUser?.id} // Can't delete self
                                        >
                                            <Icon name="trash" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {isInviteModalOpen && (
                <InviteMemberModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
            )}

            {isDeleteModalOpen && selectedUser && (
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDeleteConfirm}
                    title="Delete Team Member"
                    message={`Are you sure you want to remove ${selectedUser.name} from the organization?`}
                    isDestructive
                    confirmText="Delete"
                />
            )}
        </>
    );
};

export default TeamPage;