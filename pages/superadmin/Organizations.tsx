
// pages/superadmin/Organizations.tsx

import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
// FIX: The OrgEditorModal component is now correctly implemented, and this import resolves the module-not-found error.
import OrgEditorModal from '../../components/modals/OrgEditorModal';
import { Organization } from '../../types';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

const Organizations: React.FC = () => {
  const { useOrganizations, useDeleteOrganization } = useData();
  const { data: organizations, isLoading, error } = useOrganizations();
  const deleteOrg = useDeleteOrganization();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  const handleAdd = () => {
      setSelectedOrg(null);
      setIsModalOpen(true);
  };
  
  const handleEdit = (org: Organization) => {
      setSelectedOrg(org);
      setIsModalOpen(true);
  };

  const handleDeleteRequest = (org: Organization) => {
    setSelectedOrg(org);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
      if (selectedOrg) {
          deleteOrg.mutate(selectedOrg.id);
          setIsDeleteModalOpen(false);
      }
  };

  return (
    <>
    <Card 
      title="All Organizations" 
      actions={<Button onClick={handleAdd}><Icon name="plus"/> Add Organization</Button>}
    >
      {isLoading && <Spinner/>}
      {error && <p className="text-danger">Error loading organizations.</p>}
      {!isLoading && organizations && (
        <div className="overflow-x-auto -m-6">
          <table className="min-w-full">
            <thead className="bg-bg-default">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Industry</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Contacts</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-bg-card divide-y divide-border-default">
              {organizations.map(org => (
                <tr key={org.id} className="hover:bg-bg-default">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{org.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{org.industry}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{org.contactCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center gap-2">
                        <button onClick={() => handleEdit(org)} className="p-1 text-secondary hover:text-primary"><Icon name="edit" /></button>
                        <button onClick={() => handleDeleteRequest(org)} className="p-1 text-secondary hover:text-danger"><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>

    {isModalOpen && (
        <OrgEditorModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            organization={selectedOrg}
        />
    )}

    {isDeleteModalOpen && selectedOrg && (
        <ConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDeleteConfirm}
            title="Delete Organization"
            message={`Are you sure you want to delete ${selectedOrg.name}? This will also delete all associated users and contacts.`}
            isDestructive
            confirmText="Delete"
        />
    )}
    </>
  );
};

export default Organizations;
