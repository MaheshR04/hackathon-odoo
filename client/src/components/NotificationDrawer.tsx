import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Calendar, DollarSign, UserCheck, Megaphone, Clock, X } from 'lucide-react';
import { api } from '../services/api';
import { NotificationItem } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await api.notifications.getAll();
      if (res.success) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      console.error('Fetch notifications error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.notifications.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'leave_request':
      case 'leave_approved':
      case 'leave_rejected':
        return <Calendar className="h-4 w-4 text-purple-400" />;
      case 'payroll':
        return <DollarSign className="h-4 w-4 text-emerald-400" />;
      case 'welcome':
        return <UserCheck className="h-4 w-4 text-sky-400" />;
      case 'announcement':
      default:
        return <Megaphone className="h-4 w-4 text-amber-400" />;
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Notifications</h3>
                <p className="text-xs text-slate-400">{unreadCount} unread alerts</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium hover:bg-indigo-500/10 rounded-lg transition"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading && notifications.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">Loading alerts...</div>
            ) : notifications.length === 0 ? (
              <div className="py-16 text-center">
                <Bell className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-400">No notifications yet</p>
                <p className="text-xs text-slate-500 mt-1">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                  className={`relative p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    notif.read
                      ? 'bg-slate-900/40 border-slate-800/60 opacity-75 hover:opacity-100'
                      : 'bg-slate-800/80 border-indigo-500/30 hover:border-indigo-500/50 shadow-md'
                  }`}
                >
                  {!notif.read && (
                    <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                  )}
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 pr-3">
                      <h4 className="text-xs font-semibold text-white">{notif.title}</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notif.message}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2">
                        <Clock className="h-3 w-3" />
                        <span>{notif.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
