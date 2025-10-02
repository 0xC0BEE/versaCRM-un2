import React, { useState } from 'react';
import { Contact, ActivityType } from '../../types';
import { useData } from '../../hooks/useData';
import Spinner from '../ui/Spinner';
import Icon from '../ui/Icon';
import { formatDistanceToNow } from 'date-fns';
import { IconName } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { geminiService } from '../../services/geminiService';

interface ActivityTimelineProps {
  contact: Contact;
}

const ActivityIcon: React.FC<{ type: ActivityType }> = ({ type }) => {
    const iconMap: Record<ActivityType, { name: IconName; color: string }> = {
        [ActivityType.Note]: { name: 'clipboard', color: 'bg-yellow-400' },
        [ActivityType.Call]: { name: 'zap', color: 'bg-blue-500' },
        [ActivityType.Email]: { name: 'mail', color: 'bg-red-500' },
        [ActivityType.Meeting]: { name: 'users', color: 'bg-green-500' },
        [ActivityType.Sequence]: { name: 'sparkles', color: 'bg-purple-500' },
        [ActivityType.SMS]: { name: 'phone', color: 'bg-blue-500' },
    };
    const { name, color } = iconMap[type] || { name: 'clipboard', color: 'bg-gray-400' };

    return (
        <span className={`flex items-center justify-center w-8 h-8 rounded-full ring-8 ring-bg-default ${color}`}>
            <Icon name={name} className="w-5 h-5 text-white" />
        </span>
    );
};


const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ contact }) => {
    const { useActivities, useUsers } = useData();
    const { data: activities, isLoading } = useActivities(contact.id);
    const { data: users } = useUsers(); // Fetch all users to map createdBy id to name

    const [summary, setSummary] = useState<string | null>(null);
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);
    const [summaryError, setSummaryError] = useState<string | null>(null);

    const getUserName = (userId: string) => {
        return users?.find(u => u.id === userId)?.name || 'System';
    };
    
    const handleGetSummary = async () => {
        if (!activities || activities.length === 0) return;

        setIsSummaryLoading(true);
        setSummaryError(null);
        setSummary(null);

        try {
            const result = await geminiService.getActivitySummary(contact.name, activities);
            setSummary(result);
        } catch (error) {
            console.error("Failed to get summary:", error);
            setSummaryError("Could not generate summary at this time. Please try again later.");
        } finally {
            setIsSummaryLoading(false);
        }
    };
    
    const getActivityDescription = (activity: (typeof activities[0])) => {
        switch (activity.type) {
            case ActivityType.Note: return 'added a note';
            case ActivityType.Call: return 'logged a call';
            case ActivityType.Email: return 'sent an email';
            case ActivityType.Meeting: return 'scheduled a meeting';
            case ActivityType.SMS: return 'sent an SMS';
            case ActivityType.Sequence: return 'triggered a sequence action';
            default: return 'logged an activity';
        }
    };

    if (isLoading) return <Spinner />;

    return (
        <Card
            title="Activity Feed"
            actions={
                activities && activities.length > 0 ? (
                    <Button variant="secondary" onClick={handleGetSummary} isLoading={isSummaryLoading}>
                        <Icon name="sparkles" className="mr-2"/> Get AI Summary
                    </Button>
                ) : null
            }
        >
            {summaryError && <div className="mb-4"><p className="text-danger p-3 bg-danger/10 rounded-md">{summaryError}</p></div>}
            {summary && (
                <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <h4 className="font-semibold text-primary flex items-center gap-2 mb-2"><Icon name="sparkles" /> AI Summary</h4>
                    <p className="text-sm text-text-default whitespace-pre-wrap">{summary}</p>
                </div>
            )}

            {activities && activities.length > 0 ? (
                <ol className="relative border-l border-border-default ml-4">
                    {activities.map(activity => (
                        <li key={activity.id} className="mb-10 ml-12">
                            <ActivityIcon type={activity.type} />
                            <div className="items-center justify-between p-4 bg-bg-card border border-border-default rounded-lg shadow-sm sm:flex">
                                <time className="mb-1 text-xs font-normal text-text-secondary sm:order-last sm:mb-0">
                                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                </time>
                                <div className="text-sm font-normal text-text-secondary">
                                    <span className="font-semibold text-text-default">{getUserName(activity.createdBy)}</span>
                                    {' '}{getActivityDescription(activity)}:
                                    <p className="p-3 mt-2 text-sm bg-bg-default rounded-lg border border-border-default text-text-default">
                                        {activity.content}
                                    </p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ol>
            ) : (
                <div className="text-center p-8 bg-bg-default rounded-lg">
                    <p className="text-text-secondary">No activity has been logged for this contact yet.</p>
                </div>
            )}
        </Card>
    );
};

export default ActivityTimeline;