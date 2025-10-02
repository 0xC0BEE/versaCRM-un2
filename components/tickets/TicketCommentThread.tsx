
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Ticket, TicketComment, UserRole } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import Spinner from '../ui/Spinner';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { formatDistanceToNow } from 'date-fns';

interface TicketCommentThreadProps {
    ticket: Ticket;
}

const TicketCommentThread: React.FC<TicketCommentThreadProps> = ({ ticket }) => {
    const { currentUser } = useAuth();
    const { useTicketComments, useAddTicketComment, useUsers } = useData();

    const { data: comments, isLoading: commentsLoading } = useTicketComments(ticket.id);
    const { data: users, isLoading: usersLoading } = useUsers({ organizationId: ticket.organizationId });
    const addCommentMutation = useAddTicketComment();

    const [newComment, setNewComment] = useState('');
    const [isInternalNote, setIsInternalNote] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);


    const isClientView = currentUser?.role === UserRole.Client;
    const isTeamMember = currentUser?.role === UserRole.OrgAdmin || currentUser?.role === UserRole.TeamMember;

    const visibleComments = useMemo(() => {
        if (!comments) return [];
        return isClientView ? comments.filter(c => !c.isInternalNote) : comments;
    }, [comments, isClientView]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [visibleComments]);

    const getUser = (authorId: string) => {
        return users?.find(u => u.id === authorId);
    };

    const handleAddComment = () => {
        if (!newComment.trim() || !currentUser) return;
        addCommentMutation.mutate({
            ticketId: ticket.id,
            authorId: currentUser.id,
            content: newComment,
            createdAt: new Date().toISOString(),
            isInternalNote: isTeamMember ? isInternalNote : false,
        }, {
            onSuccess: () => {
                setNewComment('');
                setIsInternalNote(false);
            }
        });
    };

    if (commentsLoading || usersLoading) return <Spinner />;

    return (
        <div className="flex flex-col h-[60vh]">
             <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {visibleComments.map(comment => {
                    const author = getUser(comment.authorId);
                    const isMyComment = author?.id === currentUser?.id;
                    const isStaff = author?.role !== UserRole.Client;

                    if (comment.isInternalNote) {
                         return (
                            <div key={comment.id} className="p-3 bg-yellow-400/10 border-l-4 border-yellow-500 rounded-r-lg">
                                <div className="flex items-center justify-between text-xs text-yellow-700">
                                    <p><span className="font-semibold">{author?.name || 'Unknown'}</span> added an internal note</p>
                                    <p>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</p>
                                </div>
                                <p className="mt-2 text-sm text-yellow-800 whitespace-pre-wrap">{comment.content}</p>
                            </div>
                        );
                    }

                    return (
                        <div key={comment.id} className={`flex items-start gap-3 ${isMyComment ? 'justify-end' : 'justify-start'}`}>
                             {!isMyComment && (
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white font-semibold ${isStaff ? 'bg-primary' : 'bg-gray-400'}`}>
                                    {author?.name.charAt(0)}
                                </div>
                            )}
                            <div className="flex flex-col max-w-md">
                                <div className={`p-3 rounded-lg ${isMyComment ? 'bg-primary text-white rounded-br-none' : 'bg-bg-card border border-border-default rounded-bl-none'}`}>
                                   <div className="flex items-center justify-between text-xs opacity-80 mb-1 gap-4">
                                        <p className="font-semibold">{isMyComment ? 'You' : author?.name}</p>
                                        <p>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</p>
                                    </div>
                                    <p className="whitespace-pre-wrap">{comment.content}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="border-t border-border-default p-4 bg-bg-default rounded-b-lg">
                <textarea
                    rows={4}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full p-2 border border-border-default rounded-lg bg-bg-card focus:ring-primary focus:outline-none"
                    placeholder={isInternalNote ? "Add an internal note (only visible to your team)..." : "Add a reply..."}
                />
                <div className="flex justify-between items-center mt-2">
                    {isTeamMember ? (
                        <div className="flex items-center gap-2">
                             <Button
                                variant="secondary"
                                onClick={() => setIsInternalNote(prev => !prev)}
                                className={isInternalNote ? '!bg-yellow-400/20 !border-yellow-500/50' : ''}
                            >
                                <Icon name="zap" className="w-4 h-4 mr-2" />
                                {isInternalNote ? 'Internal Note' : 'Public Reply'}
                            </Button>
                        </div>
                    ) : <div></div>}
                    <Button
                        onClick={handleAddComment}
                        isLoading={addCommentMutation.isPending}
                        disabled={!newComment.trim()}
                    >
                        Send Reply
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TicketCommentThread;
