'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Check, CheckCheck, Trophy, Users, Swords, AlertCircle, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/utils/cn';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// ─── Types ────────────────────────────────────────────────────────────────────

type NotificationCategory = 'match' | 'transfer' | 'system' | 'alert' | 'info';

interface Notification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  isRead: boolean;
  createdAt: Date;
  href?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Match Result',
    message: 'Manchester United vs Arsenal ended 2-1.',
    category: 'match',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: '2',
    title: 'Transfer Confirmed',
    message: 'Erling Haaland transferred to Real Madrid.',
    category: 'transfer',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: '3',
    title: 'Import Complete',
    message: 'Season 2024/25 data import finished successfully.',
    category: 'system',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '4',
    title: 'Data Warning',
    message: '12 player records have missing nationality data.',
    category: 'alert',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
];

const CATEGORY_ICONS: Record<NotificationCategory, React.ReactNode> = {
  match: <Swords className="text-primary h-4 w-4" />,
  transfer: <Users className="text-info h-4 w-4" />,
  system: <Trophy className="text-success h-4 w-4" />,
  alert: <AlertCircle className="text-warning h-4 w-4" />,
  info: <Info className="text-muted-foreground h-4 w-4" />,
};

// ─── Notification Item ────────────────────────────────────────────────────────

function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'hover:bg-accent/50 flex gap-3 rounded-lg p-3 text-sm transition-colors',
        !notification.isRead && 'bg-primary/5',
      )}
    >
      <div className="bg-muted mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
        {CATEGORY_ICONS[notification.category]}
      </div>

      <div className="flex-1 space-y-1 overflow-hidden">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('leading-none font-medium', !notification.isRead && 'text-foreground')}>
            {notification.title}
          </p>
          {!notification.isRead && (
            <span className="bg-primary mt-0.5 h-2 w-2 shrink-0 rounded-full" />
          )}
        </div>
        <p className="text-muted-foreground line-clamp-2">{notification.message}</p>
        <p className="text-muted-foreground/60 text-xs">
          {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
        </p>
      </div>

      {!notification.isRead && (
        <button
          type="button"
          onClick={() => onMarkRead(notification.id)}
          aria-label="Mark as read"
          className="text-muted-foreground hover:text-primary mt-1 hidden h-6 w-6 shrink-0 items-center justify-center rounded group-hover:flex"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
      )}
    </motion.div>
  );
}

// ─── NotificationCenter ───────────────────────────────────────────────────────

export function NotificationCenter() {
  const [notifications, setNotifications] = React.useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [isLoading] = React.useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

  return (
    <Popover>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground relative h-9 w-9"
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            >
              <Bell className="h-4 w-4" />
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Notifications</TooltipContent>
      </Tooltip>

      <PopoverContent align="end" className="w-96 p-0" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllRead}
              className="text-muted-foreground h-7 gap-1.5 text-xs"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Body */}
        <ScrollArea className="max-h-[420px]">
          <div className="p-2">
            {isLoading ? (
              <div className="space-y-3 p-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <EmptyState
                title="No notifications"
                description="You're all caught up!"
                className="border-none py-8"
              />
            ) : (
              <div className="space-y-1">
                {notifications.map((n) => (
                  <NotificationItem key={n.id} notification={n} onMarkRead={markRead} />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
