import React from 'react';
import { ActivityItem } from '@/services/api';
import { cn } from '@/lib/utils';

interface ActivityFeedProps {
  activities: ActivityItem[];
  isLoading?: boolean;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, isLoading }) => {
  // Generate consistent color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-emerald-500',
      'bg-violet-500',
      'bg-amber-500',
      'bg-rose-500',
      'bg-cyan-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start gap-4 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/4 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity, index) => (
        <div
          key={activity.id}
          className={cn(
            'flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors',
            'slide-in-left'
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div
            className={cn(
              'h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0',
              getAvatarColor(activity.user)
            )}
          >
            <span className="text-sm font-medium text-white">
              {getInitials(activity.user)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">
              <span className="font-medium">{activity.user}</span>
              {' '}
              <span className="text-muted-foreground">{activity.action}</span>
              {' '}
              <span className="font-medium">{activity.target}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
