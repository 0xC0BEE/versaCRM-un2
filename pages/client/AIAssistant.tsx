
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ChatMessage, Contact, Order } from '../../types';
// FIX: The api service is now correctly implemented, and this import resolves the module-not-found error.
import { api } from '../../services/api';
import { geminiService } from '../../services/geminiService';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import Spinner from '../../components/ui/Spinner';

const AIAssistant: React.FC = () => {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialize = async () => {
        if (currentUser?.contactId && currentUser.organizationId) {
            const contact = await api.getContact(currentUser.contactId, currentUser.organizationId);
            const orders = (await api.getGeneric<Order>('orders', { organizationId: currentUser.organizationId }))
                               .filter((o: Order) => o.contactId === currentUser.contactId);
            
            if (contact) {
                 geminiService.startChatSession(contact, orders);
                 setIsInitialized(true);
            }
        }
    };
    initialize();
  }, [currentUser]);

  useEffect(() => {
    chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
  }, [history, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !isInitialized) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    const currentInput = input;
    
    // The library manages history internally via the service.
    
    setHistory(prev => [...prev, userMessage, { role: 'model', text: '' }]); // Add user message and empty model placeholder
    setInput('');
    setIsLoading(true);

    try {
      const stream = geminiService.sendMessageStream(currentInput);
      for await (const chunk of stream) {
        setHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1].text += chunk;
          return newHistory;
        });
      }
    } catch (error) {
      console.error(error);
      setHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1].text = "Sorry, I'm having trouble connecting. Please try again later.";
          return newHistory;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="AI Assistant">
      <div className="flex flex-col h-[60vh]">
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg-default rounded-t-md">
            {!isInitialized ? <Spinner/> :
                history.length === 0 ? (
                    <div className="text-center text-text-secondary">Ask me anything about your account or billing.</div>
                ) : (
                    history.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white"><Icon name="bot" /></div>}
                        <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-bg-card border border-border-default'}`}>
                            {msg.text || (isLoading && index === history.length-1) ? msg.text : <Spinner/>}
                        </div>
                    </div>
                    ))
                )
            }
        </div>
        <div className="p-4 border-t border-border-default flex items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isLoading || !isInitialized}
          />
          <Button onClick={handleSend} isLoading={isLoading} disabled={!isInitialized} className="ml-2">
            <Icon name="arrowUpRight" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AIAssistant;
