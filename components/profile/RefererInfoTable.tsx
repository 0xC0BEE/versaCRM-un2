// components/profile/RefererInfoTable.tsx

import React from 'react';
import { User, Contact } from '../../types';
import Card from '../ui/Card';

interface RefererInfoTableProps {
  patient: Contact;
  allUsers: User[];
}

const RefererInfoTable: React.FC<RefererInfoTableProps> = ({ patient, allUsers }) => {

  // FIX: Replaced non-existent properties with assignedToId to show the assigned user as a related contact.
  const relatedUserIds = [patient.assignedToId].filter(Boolean) as string[];
  const relatedUsers = allUsers.filter(u => relatedUserIds.includes(u.id));

  return (
    <Card title="Related Contacts">
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead>
                    <tr className="border-b dark:border-gray-700">
                        <th className="py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">Name</th>
                        <th className="py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">Role</th>
                        <th className="py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">Email</th>
                    </tr>
                </thead>
                <tbody>
                    {relatedUsers.map(user => (
                        <tr key={user.id} className="border-b dark:border-gray-700">
                            <td className="py-3 text-primary-600 font-semibold cursor-pointer hover:underline">{user.name}</td>
                            <td className="py-3">{user.role}</td>
                            <td className="py-3">{user.email}</td>
                        </tr>
                    ))}
                     {relatedUsers.length === 0 && (
                        <tr>
                            <td colSpan={3} className="text-center py-4 text-gray-500">No related contacts found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </Card>
  );
};

export default RefererInfoTable;