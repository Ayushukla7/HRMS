import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationApi } from '../api';
import { useAuth } from './AuthContext';
import { X } from 'lucide-react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await notificationApi.getAll();
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000); // Polling every 15s
      return () => clearInterval(interval);
    }
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await notificationApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        showToast,
      }}
    >
      {children}
      {/* Toast Notification Popup */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl bg-[#1c0d28]/95 backdrop-blur-xl text-[#F5EBFA] border border-[#A56ABD]/40 animate-slide-up">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              toast.type === 'success'
                ? 'bg-emerald-400 ring-2 ring-emerald-400/20'
                : toast.type === 'error'
                ? 'bg-rose-400 ring-2 ring-rose-400/20'
                : 'bg-[#A56ABD] ring-2 ring-[#A56ABD]/20'
            }`}
          />
          <span className="text-xs font-semibold text-[#F5EBFA]">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-[#E7DBEF]/60 hover:text-white p-1 rounded-xl hover:bg-white/10 transition-colors"
            aria-label="Close toast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
