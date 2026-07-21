import React, { useEffect, useRef, useState } from 'react';
import { FiBell, FiCheck, FiMessageSquare, FiCalendar, FiDollarSign, FiStar, FiX } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { markNotificationRead, markAllNotificationsRead, setNotifications } from '../../store/notificationSlice';
import { notificationApi } from '../../services/communicationApi';
import { useNavigate } from 'react-router-dom';

const TYPE_CONFIG: Record<number, { icon: React.ReactNode; color: string; bg: string }> = {
  0: { icon: <FiMessageSquare size={13} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },  // Inquiry
  1: { icon: <FiCalendar size={13} />, color: '#818cf8', bg: 'rgba(129,140,248,0.15)' },       // Appointment
  2: { icon: <FiMessageSquare size={13} />, color: 'var(--accent)', bg: 'rgba(183,94,255,0.15)' }, // Message
  3: { icon: <FiDollarSign size={13} />, color: '#4ade80', bg: 'rgba(74,222,128,0.15)' },       // Offer
  4: { icon: <FiStar size={13} />, color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },            // Review
};

const NotificationDropdown: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount } = useAppSelector((s) => s.notification);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch on first open
  useEffect(() => {
    if (!open) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const { data } = await notificationApi.getAll();
        dispatch(setNotifications(data));
      } catch { /* noop */ }
      finally { setLoading(false); }
    };
    fetch();
  }, [open, dispatch]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const formatTime = (dt: string) => {
    const d = new Date(dt);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const recentNotifications = notifications.slice(0, 8);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        id="notification-bell-btn"
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all"
        style={{
          background: open ? 'rgba(183,94,255,0.15)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${open ? 'rgba(183,94,255,0.3)' : 'var(--border)'}`,
          color: open ? 'var(--accent)' : 'var(--text-secondary)',
          cursor: 'pointer',
        }}
      >
        <FiBell size={17} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs font-bold flex items-center justify-center"
            style={{ background: 'var(--accent)', color: '#fff', fontSize: '10px' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          className="absolute right-0 top-12 w-80 rounded-2xl z-50 overflow-hidden"
          style={{
            background: 'rgba(15,23,42,0.98)',
            border: '1px solid rgba(183,94,255,0.2)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(20px)',
            animation: 'fadeInUp 0.2s ease',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(183,94,255,0.2)', color: 'var(--accent)' }}>
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs flex items-center gap-1 px-2 py-1 rounded-lg transition-all"
                  style={{ color: 'var(--accent)', cursor: 'pointer', background: 'rgba(183,94,255,0.1)', border: 'none' }}
                >
                  <FiCheck size={11} /> All read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg"
                style={{ color: 'var(--text-secondary)', cursor: 'pointer', background: 'transparent', border: 'none' }}
              >
                <FiX size={14} />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="w-5 h-5 border-2 rounded-full animate-spin"
                  style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="text-center py-8 flex flex-col items-center gap-2">
                <FiBell size={24} style={{ color: 'var(--text-secondary)' }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>All caught up!</p>
              </div>
            ) : (
              recentNotifications.map((notif) => {
                const config = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG[2];
                return (
                  <div
                    key={notif.id}
                    className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-all border-b"
                    style={{
                      borderColor: 'var(--border)',
                      background: notif.isRead ? 'transparent' : 'rgba(183,94,255,0.04)',
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = notif.isRead ? 'transparent' : 'rgba(183,94,255,0.04)'; }}
                    onClick={() => navigate('/notifications')}
                  >
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: config.bg, color: config.color }}>
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs leading-relaxed" style={{ color: notif.isRead ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                        {notif.content}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
                        {formatTime(notif.createdAt)}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <button
                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 transition-all"
                        style={{ background: 'rgba(183,94,255,0.2)', border: '1px solid rgba(183,94,255,0.4)', cursor: 'pointer' }}
                        title="Mark as read"
                      >
                        <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={() => { setOpen(false); navigate('/notifications'); }}
              className="w-full py-2 rounded-xl text-xs font-semibold text-center transition-all"
              style={{
                background: 'rgba(183,94,255,0.1)',
                color: 'var(--accent)',
                border: '1px solid rgba(183,94,255,0.2)',
                cursor: 'pointer',
              }}
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
