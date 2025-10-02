
// components/profile/AssignedToCard.tsx

import React from 'react';
import { Contact, User, IndustryConfig } from '../../types';
import Select from '../ui/Select';

interface AssignedToCardProps {
    patient: Contact;
    teamMembers: User[];
    isEditMode: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    industryConfig: IndustryConfig;
}

const AssignedToCard: React.FC<AssignedToCardProps> = ({ patient, teamMembers, isEditMode, onInputChange, industryConfig }) => {
    const assignedMemberId = patient.assignedToId || '';
    const assignedMember = teamMembers.find(tm => tm.id === assignedMemberId);
    
    const cardTitle = industryConfig.fieldLabels.assignedToId;

    return (
        <div className="relative bg-gradient-to-br from-primary to-green-400 text-white p-6 rounded-lg shadow-lg overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full"></div>
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-white/10 rounded-full"></div>
            
            <div className="relative z-10">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{cardTitle}</h3>
                </div>
                {isEditMode ? (
                    <Select label="" name="assignedToId" value={assignedMemberId} onChange={onInputChange} className="bg-black/20 border-white/20 text-white">
                        <option value="" className="text-black">Unassigned</option>
                        {teamMembers.map(member => (
                            <option key={member.id} value={member.id} className="text-black">{member.name}</option>
                        ))}
                    </Select>
                ) : (
                    <div className="flex items-center space-x-3">
                        {assignedMember ? (
                            <>
                                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold">
                                    {assignedMember.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-xl font-bold">{assignedMember.name}</p>
                                    <p className="text-sm opacity-80">{assignedMember.email}</p>
                                </div>
                            </>
                        ) : (
                            <p className="opacity-80">Unassigned</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssignedToCard;