import React, { useRef } from 'react';
import { Contact, Document } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useNotification } from '../../hooks/useNotification';
import Spinner from '../ui/Spinner';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import Card from '../ui/Card';

interface DocumentsTabProps {
  contact: Contact;
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({ contact }) => {
    const { currentUser } = useAuth();
    const { useDocuments, useAddDocument, useUpdateDocument, useDeleteDocument, useUsers } = useData();
    const { addNotification } = useNotification();

    const { data: documents, isLoading } = useDocuments(contact.id);
    const { data: users } = useUsers();
    const addDocumentMutation = useAddDocument();
    const updateDocumentMutation = useUpdateDocument();
    const deleteDocumentMutation = useDeleteDocument();
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0 && currentUser) {
            const file = files[0];
            addDocumentMutation.mutate({
                contactId: contact.id,
                organizationId: contact.organizationId,
                name: file.name,
                url: '#', // Mock URL
                uploadedAt: new Date().toISOString(),
                uploadedById: currentUser.id,
                sharedWithClient: false,
            }, {
                onSuccess: () => addNotification(`File "${file.name}" uploaded successfully.`, 'success'),
                onError: () => addNotification('File upload failed.', 'error')
            });
        }
    };

    const handleShareToggle = (doc: Document) => {
        updateDocumentMutation.mutate({ ...doc, sharedWithClient: !doc.sharedWithClient });
    };
    
    const handleDelete = (docId: string) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            deleteDocumentMutation.mutate(docId);
        }
    };
    
    const getUserName = (userId: string) => users?.find(u => u.id === userId)?.name || 'Unknown User';

    if (isLoading) return <Spinner />;

    return (
        <Card title="Manage Documents" actions={
            <Button onClick={handleUploadClick} isLoading={addDocumentMutation.isPending}>
                <Icon name="plus" /> Upload File
            </Button>
        }>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <div className="overflow-x-auto -m-6">
                <table className="min-w-full">
                    <thead className="bg-bg-default">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">File Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Uploaded By</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Shared with Client</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-bg-card divide-y divide-border-default">
                        {documents?.map(doc => (
                            <tr key={doc.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">{doc.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{getUserName(doc.uploadedById)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <label htmlFor={`share-${doc.id}`} className="flex items-center cursor-pointer">
                                        <div className="relative">
                                            <input
                                                id={`share-${doc.id}`}
                                                type="checkbox"
                                                className="sr-only"
                                                checked={doc.sharedWithClient}
                                                onChange={() => handleShareToggle(doc)}
                                            />
                                            <div className="block bg-border-default w-10 h-6 rounded-full"></div>
                                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${doc.sharedWithClient ? 'transform translate-x-4 !bg-primary' : ''}`}></div>
                                        </div>
                                    </label>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <button onClick={() => handleDelete(doc.id)} className="p-1 text-secondary hover:text-danger">
                                        <Icon name="trash" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {documents?.length === 0 && (
                    <p className="text-center text-text-secondary py-8">No documents have been uploaded for this contact.</p>
                )}
            </div>
        </Card>
    );
};

export default DocumentsTab;