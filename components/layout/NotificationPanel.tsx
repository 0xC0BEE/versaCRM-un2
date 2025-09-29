
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../../types';
import { useData } from '../../hooks/useData';
import { formatDistanceToNow } from 'date-fns';

interface NotificationPanelProps {
  alerts: Alert[];
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ alerts, onClose }) => {
  const navigate = useNavigate();
  const { useMarkAlertAsRead } = useData();
  const markAsReadMutation = useMarkAlertAsRead();

  const handleNotificationClick = (alert: Alert) => {
    if (!alert.read) {
      markAsReadMutation.mutate(alert.id);
    }
    if (alert.linkTo) {
      navigate(alert.linkTo);
    }
    onClose();
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-bg-card rounded-md shadow-lg border border-border-default">
      <div className="p-3 border-b border-border-default">
        <h3 className="font-semibold text-text-default">Notifications</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <p className="text-center text-text-secondary p-4">No new notifications.</p>
        ) : (
          alerts.map(alert => (
            <div
              key={alert.id}
              onClick={() => handleNotificationClick(alert)}
              className={`p-3 border-b border-border-default last:border-b-0 hover:bg-bg-default cursor-pointer flex items-start gap-3 ${!alert.read ? 'bg-primary/5' : ''}`}
            >
              {!alert.read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>}
              <div className={alert.read ? 'pl-5' : ''}>
                <p className="text-sm text-text-default">{alert.message}</p>
                <p className="text-xs text-text-secondary mt-1">{formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
