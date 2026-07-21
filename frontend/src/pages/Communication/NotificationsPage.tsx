import React, { useEffect, useState } from 'react';
import {
  FiBell,
  FiCheck,
  FiMessageSquare,
  FiCalendar,
  FiDollarSign,
  FiStar,
  FiFilter,
} from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  markNotificationRead,
  markAllNotificationsRead,
  setNotifications,
} from '../../store/notificationSlice';
import { notificationApi } from '../../services/communicationApi';

const TYPE_CONFIG: Record<number, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  0: { label: 'Inquiry', icon: <FiMessageSquare size={15} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  1: { label: 'Appointment', icon: <FiCalendar size={15} />, color: '#818cf8', bg: 'rgba(129,140,248,0.15)' },
  2: { label: 'Message', icon: <FiMessageSquare size={15} />, color: 'var(--accent)', bg: 'rgba(183,94,255,0.15)' },
  3: { label: 'Offer', icon: <FiDollarSign size={15} />, color: '#4ade80', bg: 'rgba(74,222,128,0.15)' },
  4: { label: 'Review', icon: <FiStar size={15} />, color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
};

const NotificationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount } = useAppSelector((s) => s.notification);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<number | null>(null);
  const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await notificationApi.getAll();
        dispatch(setNotifications(data));
      } catch { /* noop */ }
      finally { setLoading(false); }
    };
    load();
  }, [dispatch]);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      dispatch(markNotificationRead(id));
    } catch { /* noop */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      dispatch(markAllNotificationsRead());
    } catch { /* noop */ }
  };

  const filtered = notifications.filter((n) => {
    if (filterType !== null && n.type !== filterType) return false;
    if (filterRead === 'unread' && n.isRead) return false;
    if (filterRead === 'read' && !n.isRead) return false;
    return true;
  });

  const formatTime = (dt: string) => {
    const d = new Date(dt);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--heading)', color: 'var(--text-primary)' }}>
            Notifications
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
            style={{
              background: 'rgba(183,94,255,0.1)',
              color: 'var(--accent)',
              border: '1px solid rgba(183,94,255,0.25)',
              cursor: 'pointer',
            }}
          >
            <FiCheck size={15} /> Mark All as Read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <FiFilter size={13} style={{ color: 'var(--text-secondary)' }} />
          {(['all', 'unread', 'read'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setFilterRead(r)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium capitalize"
              style={{
                background: filterRead === r ? 'rgba(183,94,255,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${filterRead === r ? 'rgba(183,94,255,0.4)' : 'var(--border)'}`,
                color: filterRead === r ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="h-5 w-px mx-1 self-center" style={{ background: 'var(--border)' }} />

        {/* Type filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterType(null)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium"
            style={{
              background: filterType === null ? 'rgba(183,94,255,0.2)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${filterType === null ? 'rgba(183,94,255,0.4)' : 'var(--border)'}`,
              color: filterType === null ? 'var(--accent)' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            All Types
          </button>
          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setFilterType(Number(key))}
              className="px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5"
              style={{
                background: filterType === Number(key) ? cfg.bg : 'rgba(255,255,255,0.04)',
                border: `1px solid ${filterType === Number(key) ? cfg.color + '50' : 'var(--border)'}`,
                color: filterType === Number(key) ? cfg.color : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {cfg.icon} {cfg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notification Feed */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(183,94,255,0.08)', border: '1px solid var(--border)' }}>
            <FiBell size={28} style={{ color: 'var(--text-secondary)' }} />
          </div>
          <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>No notifications found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((notif) => {
            const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG[2];
            return (
              <div
                key={notif.id}
                className="flex items-start gap-4 p-4 rounded-2xl transition-all"
                style={{
                  background: notif.isRead ? 'rgba(15,23,42,0.4)' : 'rgba(183,94,255,0.06)',
                  border: `1px solid ${notif.isRead ? 'var(--border)' : 'rgba(183,94,255,0.2)'}`,
                }}
              >
                {/* Type Icon */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: cfg.bg, color: cfg.color }}>
                  {cfg.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed"
                    style={{ color: notif.isRead ? 'var(--text-secondary)' : 'var(--text-primary)', fontWeight: notif.isRead ? 400 : 500 }}>
                    {notif.content}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
                      {formatTime(notif.createdAt)}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg text-xs"
                      style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
                    style={{
                      background: 'rgba(183,94,255,0.1)',
                      color: 'var(--accent)',
                      border: '1px solid rgba(183,94,255,0.25)',
                      cursor: 'pointer',
                    }}
                  >
                    <FiCheck size={11} /> Read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
