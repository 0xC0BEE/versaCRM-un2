import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Icon from '../../components/ui/Icon';
import Button from '../../components/ui/Button';

const DocumentsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { useDocuments, useUsers } = useData();

  const { data: documents, isLoading: docsLoading } = useDocuments(currentUser?.contactId);
  const { data: users, isLoading: usersLoading } = useUsers();

  const sharedDocuments = documents?.filter(doc => doc.sharedWithClient) || [];
  const getUserName = (userId: string) => users?.find(u => u.id === userId)?.name || 'Staff Member';
  
  const isLoading = docsLoading || usersLoading;

  return (
    <Card title="My Documents">
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="overflow-x-auto -m-6">
          <table className="min-w-full">
            <thead className="bg-bg-default">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">File Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Uploaded By</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-bg-card divide-y divide-border-default">
              {sharedDocuments.map(doc => (
                <tr key={doc.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-default flex items-center gap-2">
                    <Icon name="file" className="text-primary"/>
                    {doc.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{getUserName(doc.uploadedById)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Button variant="secondary" onClick={() => window.open(doc.url, '_blank')} className="!py-1 !px-3">
                        Download
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sharedDocuments.length === 0 && (
            <p className="text-center text-text-secondary p-8">You have no shared documents at this time.</p>
          )}
        </div>
      )}
    </Card>
  );
};

export default DocumentsPage;