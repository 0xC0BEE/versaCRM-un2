import React, { useState, useRef, useEffect } from 'react';
import { Contact, User, DirectMessage } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import Spinner from '../ui/Spinner';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Icon from '../ui/Icon';

interface MessagesTabProps {
  contact: Contact;
}

const MessagesTab: React.FC<MessagesTabProps> = ({ contact }) => {
    const { currentUser } = useAuth();
    const { useDirectMessages, useAddDirectMessage, useUsers } = useData();
    
    const { data: messages, isLoading } = useDirectMessages(contact.id);
    const { data: users } = useUsers({ ids: [contact.assignedToId, currentUser?.id] });
    const addMessageMutation = useAddDirectMessage();

    const [newMessage, setNewMessage] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);
    
    const clientUser = users?.find(u => u.contactId === contact.id);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = () => {
        if (!newMessage.trim() || !currentUser || !clientUser) return;
        
        addMessageMutation.mutate({
            contactId: contact.id,
            organizationId: contact.organizationId,
            senderId: currentUser.id,
            receiverId: clientUser.id,
            content: newMessage,
        }, {
            onSuccess: () => setNewMessage('')
        });
    };

    if (isLoading) return <Spinner />;
    
    if (!contact.assignedToId) {
        return <div className="text-center p-8 text-text-secondary">This contact must be assigned to a team member to use messaging.</div>;
    }

    return (
        <div className="flex flex-col h-[60vh] border border-border-default rounded-lg">
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg-default">
                {messages?.map((msg: DirectMessage) => {
                    const isSentByMe = msg.senderId === currentUser?.id;
                    const sender = users?.find(u => u.id === msg.senderId);
                    return (
                        <div key={msg.id} className={`flex items-start gap-3 ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
                            {!isSentByMe && (
                                <div className="w-8 h-8 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center text-white font-semibold">
                                    {sender?.name.charAt(0)}
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
                 {messages?.length === 0 && <p className="text-center text-text-secondary">Start the conversation!</p>}
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
                    <Icon name="arrowUpRight" />
                </Button>
            </div>
        </div>
    );
};

export default MessagesTab;