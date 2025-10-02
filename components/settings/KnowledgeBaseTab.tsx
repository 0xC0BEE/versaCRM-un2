import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { KnowledgeBaseArticle } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import Spinner from '../ui/Spinner';
import Input from '../ui/Input';
import ConfirmationModal from '../ui/ConfirmationModal';

interface ArticleEditorProps {
    article: Partial<KnowledgeBaseArticle> | null;
    onSave: (article: Partial<KnowledgeBaseArticle>) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({ article, onSave, onCancel, isLoading }) => {
    const [title, setTitle] = useState(article?.title || '');
    const [content, setContent] = useState(article?.content || '');

    const handleSave = () => {
        onSave({ ...article, title, content });
    };

    return (
        <Card title={article?.id ? 'Edit Article' : 'New Article'}>
            <div className="space-y-4">
                <Input label="Title" value={title} onChange={e => setTitle(e.target.value)} />
                <textarea
                    rows={10}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="w-full p-2 border border-border-default rounded-lg bg-bg-card focus:ring-primary focus:outline-none"
                    placeholder="Write your article content here..."
                />
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={onCancel}>Cancel</Button>
                    <Button onClick={handleSave} isLoading={isLoading}>Save Article</Button>
                </div>
            </div>
        </Card>
    )
}

const KnowledgeBaseTab: React.FC = () => {
    const { currentUser } = useAuth();
    const { 
        useKnowledgeBaseArticles, 
        useAddKnowledgeBaseArticle, 
        useUpdateKnowledgeBaseArticle, 
        useDeleteKnowledgeBaseArticle 
    } = useData();

    const { data: articles, isLoading } = useKnowledgeBaseArticles(currentUser?.organizationId);
    const addArticleMutation = useAddKnowledgeBaseArticle();
    const updateArticleMutation = useUpdateKnowledgeBaseArticle();
    const deleteArticleMutation = useDeleteKnowledgeBaseArticle();

    const [editingArticle, setEditingArticle] = useState<KnowledgeBaseArticle | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [deletingArticle, setDeletingArticle] = useState<KnowledgeBaseArticle | null>(null);

    const handleSave = (article: Partial<KnowledgeBaseArticle>) => {
        if (article.id) { // Update
            updateArticleMutation.mutate(article as KnowledgeBaseArticle, {
                onSuccess: () => {
                    setEditingArticle(null);
                }
            });
        } else { // Create
            addArticleMutation.mutate({
                ...article,
                organizationId: currentUser!.organizationId,
                createdAt: new Date().toISOString()
            } as Omit<KnowledgeBaseArticle, 'id'>, {
                onSuccess: () => {
                    setIsCreating(false);
                }
            });
        }
    };
    
    const handleCancel = () => {
        setEditingArticle(null);
        setIsCreating(false);
    };

    if (isLoading) return <Spinner />;

    if (isCreating || editingArticle) {
        return (
            <ArticleEditor 
                article={editingArticle}
                onSave={handleSave}
                onCancel={handleCancel}
                isLoading={addArticleMutation.isPending || updateArticleMutation.isPending}
            />
        )
    }

    return (
        <>
        <Card
            title="Knowledge Base"
            actions={<Button onClick={() => setIsCreating(true)}><Icon name="plus" /> New Article</Button>}
        >
            <div className="space-y-4">
                <p className="text-sm text-text-secondary">
                    Create articles for your AI Assistant to use when answering client questions.
                </p>
                {articles?.map(article => (
                    <div key={article.id} className="p-4 border border-border-default rounded-lg bg-bg-default">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-semibold text-text-default">{article.title}</h4>
                                <p className="text-xs text-text-secondary mt-1">Created on {new Date(article.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="secondary" className="!p-2" onClick={() => setEditingArticle(article)}>
                                    <Icon name="edit" />
                                </Button>
                                <Button variant="secondary" className="!p-2" onClick={() => setDeletingArticle(article)}>
                                    <Icon name="trash" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
                 {articles?.length === 0 && <p className="text-center text-sm text-text-secondary py-4">No articles have been created yet.</p>}
            </div>
        </Card>
        {deletingArticle && (
            <ConfirmationModal
                isOpen={!!deletingArticle}
                onClose={() => setDeletingArticle(null)}
                onConfirm={() => {
                    deleteArticleMutation.mutate(deletingArticle.id);
                    setDeletingArticle(null);
                }}
                title="Delete Article"
                message={`Are you sure you want to delete the article "${deletingArticle.title}"?`}
                isDestructive
            />
        )}
        </>
    );
};

// FIX: Added default export to make the component importable in SettingsPage.
export default KnowledgeBaseTab;