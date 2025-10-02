import React, { useState } from 'react';
import { Contact } from '../../types';
import { geminiService } from '../../services/geminiService';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Spinner from '../ui/Spinner';

interface AIEmailAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
  onDraftGenerated: (subject: string, body: string) => void;
}

const AIEmailAssistantModal: React.FC<AIEmailAssistantModalProps> = ({ isOpen, onClose, contact, onDraftGenerated }) => {
    const [prompt, setPrompt] = useState('');
    const [tone, setTone] = useState('Professional');
    const [isLoading, setIsLoading] = useState(false);
    const [draft, setDraft] = useState<{ subject: string; body: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setError(null);
        setDraft(null);
        try {
            const result = await geminiService.generateEmailDraft(prompt, tone, contact);
            setDraft(result);
        } catch (err) {
            setError('Failed to generate draft. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUseDraft = () => {
        if (draft) {
            onDraftGenerated(draft.subject, draft.body);
            handleClose();
        }
    };
    
    // Reset state on close
    const handleClose = () => {
        setPrompt('');
        setTone('Professional');
        setDraft(null);
        setError(null);
        onClose();
    }

    const footer = (
        <>
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            {draft ? (
                <Button onClick={handleUseDraft}>Use this Draft</Button>
            ) : (
                <Button onClick={handleGenerate} isLoading={isLoading} disabled={!prompt.trim()}>Generate</Button>
            )}
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="AI Email Assistant"
            footer={footer}
        >
            <div className="space-y-4">
                {isLoading && <div className="absolute inset-0 bg-bg-card/50 flex items-center justify-center"><Spinner /></div>}
                
                {!draft && !isLoading ? (
                    <>
                        <div>
                            <label htmlFor="ai-prompt" className="block text-sm font-medium text-text-secondary mb-1">
                                What is this email about?
                            </label>
                            <textarea
                                id="ai-prompt"
                                rows={3}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., Follow up on our last meeting about their care plan"
                                className="w-full p-2 border border-border-default rounded-lg bg-bg-card focus:ring-primary focus:outline-none"
                            />
                        </div>
                        <Select label="Tone of Voice" value={tone} onChange={e => setTone(e.target.value)}>
                            <option>Professional</option>
                            <option>Casual</option>
                            <option>Persuasive</option>
                            <option>Friendly</option>
                            <option>Empathetic</option>
                        </Select>
                    </>
                ) : draft && !isLoading ? (
                    <div className="space-y-4 animate-fade-in">
                        <Input label="Generated Subject" value={draft.subject} readOnly />
                        <div>
                           <label className="block text-sm font-medium text-text-secondary mb-1">
                                Generated Body
                            </label>
                           <textarea
                                rows={10}
                                value={draft.body}
                                readOnly
                                className="w-full p-2 border border-border-default rounded-lg bg-bg-default focus:ring-primary focus:outline-none"
                            />
                        </div>
                    </div>
                ) : null}

                 {error && <p className="text-danger text-sm text-center">{error}</p>}
            </div>
        </Modal>
    );
};

export default AIEmailAssistantModal;