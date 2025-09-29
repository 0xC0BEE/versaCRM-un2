
import React from 'react';
import MyTasks from './MyTasks';

const TeamMemberConsole: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Team Member Portal</h1>
            <MyTasks />
        </div>
    );
};

export default TeamMemberConsole;
