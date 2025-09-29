
import React, { useState } from 'react';
import { User } from '../types';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
// FIX: The InviteMemberModal component is now correctly implemented, and this import resolves the module-not-found error.
import InviteMemberModal from '../components/modals/InviteMemberModal';
import ConfirmationModal from '../components/ui/ConfirmationModal';

const TeamPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { useTeamMembers, useDeleteUser } = useData();
    const { data: teamMembers, isLoading } = useTeamMembers(currentUser?.organizationId);
    const deleteUser = useDeleteUser();
    
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const handleDeleteRequest = (user: User) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if(selectedUser) {
            deleteUser.mutate(selectedUser.id);
            setIsDeleteModalOpen(false);
        }
    };

    const Avatar = ({ name }: { name: string }) => (
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
            {name.charAt(0)}
        </div>
    );

    return (
        <>
        <Card title="Team Members" actions={<Button onClick={() => setIsInviteModalOpen(true)}><Icon name="plus" />Invite Member</Button>}>
            {isLoading ? <Spinner /> : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teamMembers?.map((member: User) => (
                        <div key={member.id} className="bg-bg-default border border-border-default p-4 rounded-lg flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Avatar name={member.name} />
                                <div>
                                    <p className="font-semibold text-text-default">{member.name}</p>
                                    <p className="text-sm text-text-secondary">{member.role}</p>
                                </div>
                            </div>
                            <button onClick={() => handleDeleteRequest(member)} className="p-1 text-secondary hover:text-danger">
                                <Icon name="trash"/>
                            </button>
                        </div>
                    ))}
                    {teamMembers?.length === 0 && <p className="text-center text-text-secondary col-span-full py-8">No team members yet.</p>}
                </div>
            )}
        </Card>

        {isInviteModalOpen && (
            <InviteMemberModal 
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
            />
        )}
        {isDeleteModalOpen && selectedUser && (
             <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Remove Team Member"
                message={`Are you sure you want to remove ${selectedUser.name} from the team?`}
                isDestructive
                confirmText="Remove"
            />
        )}
        </>
    );
};

export default TeamPage;
