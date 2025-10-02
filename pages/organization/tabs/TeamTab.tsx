

import React from 'react';
import { Organization, User } from '../../../types';
import { useData } from '../../../hooks/useData';
import Card from '../../../components/ui/Card';
import Spinner from '../../../components/ui/Spinner';
import { useOutletContext } from 'react-router-dom';

const TeamTab: React.FC = () => {
    // FIX: Get organization data from parent route's context.
    const { organization } = useOutletContext<{ organization: Organization }>();
    const { useTeamMembers } = useData();
    const { data: teamMembers, isLoading } = useTeamMembers(organization.id);

    return (
        <Card title="Team Members">
            {isLoading ? <Spinner /> : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teamMembers?.map((member: User) => (
                        <div key={member.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-center space-x-4">
                            <img src={member.avatarUrl} alt={member.name} className="h-12 w-12 rounded-full"/>
                            <div>
                                <p className="font-semibold">{member.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

export default TeamTab;