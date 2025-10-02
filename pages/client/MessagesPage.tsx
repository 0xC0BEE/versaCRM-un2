import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { DirectMessage, User } from '../../types';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';

const MessagesPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { useDirectMessages, useAddDirectMessage, useContact, useUsers } = useData();

    const { data: contact } = useContact(currentUser?.contactId, currentUser?.organizationId);
    const { data: messages, isLoading } = useDirectMessages(currentUser?.contactId || '');
    const addMessageMutation = useAddDirectMessage();
    
    // Get the assigned team member to message
    const { data: users } = useUsers({ ids: [contact?.assignedToId, currentUser?.id].filter(Boolean) });
    const assignedTeamMember = users?.find(u => u.id === contact?.assignedToId);

    const [newMessage, setNewMessage] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = () => {
        if (!newMessage.trim() || !currentUser || !contact || !assignedTeamMember) return;
        
        addMessageMutation.mutate({
            contactId: contact.id,
            organizationId: contact.organizationId,
            senderId: currentUser.id,
            receiverId: assignedTeamMember.id,
            content: newMessage,
        }, {
            onSuccess: () => setNewMessage('')
        });
    };
    
    if (isLoading) return <Spinner />;

    if (!assignedTeamMember) {
        return (
            <Card title="Messages">
                <div className="text-center p-8 text-text-secondary">
                    You are not currently assigned to a team member. Messaging is unavailable.
                </div>
            </Card>
        );
    }

    return (
        <Card title={`Messages with ${assignedTeamMember.name}`}>
            <div className="flex flex-col h-[70vh]">
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg-default rounded-t-lg">
                    {messages?.map((msg: DirectMessage) => {
                        const isSentByMe = msg.senderId === currentUser?.id;
                        return (
                             <div key={msg.id} className={`flex items-start gap-3 ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
                                {!isSentByMe && (
                                    <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white font-semibold">
                                        {assignedTeamMember?.name.charAt(0)}
                                    </div>
                                )}
                                <div className="flex flex-col">
                                    <div className={`max-w-md p-3 rounded-lg ${isSentByMe ? 'bg-primary text-white rounded-br-none' : 'bg-bg-card border border-border-default rounded-bl-none'}`}>
                                        {msg.content}
                                    </div>
                                    <span className={`text-xs text-text-secondary mt-1 ${isSentByMe ? 'text-right' : 'text-left'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                     {messages?.length === 0 && <p className="text-center text-text-secondary">Send a message to get started.</p>}
                </div>
                <div className="p-4 border-t border-border-default flex items-center gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your message..."
                        className="flex-1"
                        disabled={addMessageMutation.isPending}
                    />
                    <Button onClick={handleSendMessage} isLoading={addMessageMutation.isPending}>
                        Send
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default MessagesPage;