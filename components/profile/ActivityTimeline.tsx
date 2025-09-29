
import React, { useState } from 'react';
import { Contact, ActivityType } from '../../types';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import Icon from '../ui/Icon';

interface ActivityTimelineProps {
  contact: Contact;
}

const ActivityIcon = ({ type }: { type: ActivityType }) => {
    const iconMap: Record<ActivityType, string> = {
        [ActivityType.Note]: 'clipboard',
        [ActivityType.Email]: 'edit', // Placeholder
        [ActivityType.Call]: 'zap', // Placeholder
        [ActivityType.Meeting]: 'users',
    };
    return (
        <div className="absolute w-8 h-8 bg-bg-default rounded-full mt-2 -left-4 border-4 border-bg-card flex items-center justify-center">
            <Icon name={iconMap[type] as any} className="w-4 h-4 text-text-secondary" />
        </div>
    );
};

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ contact }) => {
    const { currentUser } = useAuth();
    const { useActivities, useAddActivity, useUsers } = useData();
    const { data: activities, isLoading } = useActivities(contact.id);
    const addActivityMutation = useAddActivity();
    
    const userIds = activities?.map(a => a.createdBy) || [];
    const { data: users } = useUsers({ ids: userIds });

    const [newActivityContent, setNewActivityContent] = useState('');
    const [activityType, setActivityType] = useState<ActivityType>(ActivityType.Note);
    
    const handleAddActivity = () => {
        if (!newActivityContent.trim()) return;
        addActivityMutation.mutate({
            contactId: contact.id,
            organizationId: contact.organizationId,
            type: activityType,
            content: newActivityContent,
            createdAt: new Date().toISOString(),
            createdBy: currentUser!.id,
        }, {
            onSuccess: () => setNewActivityContent('')
        });
    };
    
    const getUserName = (id: string) => users?.find(u => u.id === id)?.name || 'System';

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
                <Card title="Activity Feed">
                    {isLoading && <Spinner/>}
                    {!isLoading && activities && (
                        <div className="relative border-l-2 border-border-default ml-4 pl-8 py-4 space-y-8">
                            {activities.map(activity => (
                                <div key={activity.id} className="relative">
                                    <ActivityIcon type={activity.type}/>
                                    <p className="text-sm text-text-secondary">
                                        {getUserName(activity.createdBy)} logged a {activity.type.toLowerCase()}
                                    </p>
                                    <p className="font-semibold text-text-default whitespace-pre-wrap">{activity.content}</p>
                                    <p className="text-xs text-text-secondary mt-1">{new Date(activity.createdAt).toLocaleString()}</p>
                                </div>
                            ))}
                             {activities.length === 0 && <p className="text-center text-text-secondary">No activity logged yet.</p>}
                        </div>
                    )}
                </Card>
            </div>
            <div>
                 <Card title="Log Activity">
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Button variant={activityType === ActivityType.Note ? 'primary' : 'secondary'} onClick={() => setActivityType(ActivityType.Note)} className="flex-1 text-xs !py-1">Note</Button>
                            <Button variant={activityType === ActivityType.Call ? 'primary' : 'secondary'} onClick={() => setActivityType(ActivityType.Call)} className="flex-1 text-xs !py-1">Call</Button>
                            <Button variant={activityType === ActivityType.Meeting ? 'primary' : 'secondary'} onClick={() => setActivityType(ActivityType.Meeting)} className="flex-1 text-xs !py-1">Meeting</Button>
                        </div>
                        <textarea
                            rows={4}
                            value={newActivityContent}
                            onChange={(e) => setNewActivityContent(e.target.value)}
                            placeholder={`Log details about the ${activityType.toLowerCase()}...`}
                            className="w-full p-2 border border-border-default rounded-lg bg-bg-card focus:ring-primary focus:outline-none"
                        />
                        <Button onClick={handleAddActivity} isLoading={addActivityMutation.isPending} className="w-full">
                            Log {activityType}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ActivityTimeline;
