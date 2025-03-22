'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  _id: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  fetchNotifications: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  notificationsEnabled: boolean; 
  toggleNotifications: () => void; 
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true); 
  const [lastSeenTimestamp, setLastSeenTimestamp] = useState<Date | null>(null); 
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);
  const prevUnreadCountRef = useRef(0);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      notificationSoundRef.current = new Audio('/sounds/notificationSound.wav');

      const storedSoundPreference = localStorage.getItem('notificationSoundEnabled');
      if (storedSoundPreference !== null) {
        setSoundEnabled(storedSoundPreference === 'true');
      }
      
      const storedNotificationsPreference = localStorage.getItem('notificationsEnabled');
      if (storedNotificationsPreference !== null) {
        setNotificationsEnabled(storedNotificationsPreference === 'true');
      }
      
      const storedLastSeen = localStorage.getItem('lastSeenTimestamp');
      if (storedLastSeen) {
        setLastSeenTimestamp(new Date(storedLastSeen));
      }
    }

    if (session?.user) {
      axios.get('/api/profile')
        .then(response => {
          if (response.data && response.data.notificationsEnabled !== undefined) {
            setNotificationsEnabled(response.data.notificationsEnabled);
            localStorage.setItem('notificationsEnabled', response.data.notificationsEnabled.toString());
          }
        })
        .catch(err => console.error('Failed to fetch notification settings:', err));
    }
  }, [session]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('notificationSoundEnabled', newValue.toString());
      return newValue;
    });
  }, []);

  const toggleNotifications = useCallback(async () => {
    try {
      const newValue = !notificationsEnabled;

      const response = await axios.post('/api/profile/toggle-notifications', {
        enabled: newValue
      });
      
      if (response.data.success) {
        setNotificationsEnabled(newValue);
        localStorage.setItem('notificationsEnabled', newValue.toString());

        if (newValue) {
          const now = new Date();
          setLastSeenTimestamp(now);
          localStorage.setItem('lastSeenTimestamp', now.toISOString());
        }

        toast({
          title: `Notifications ${newValue ? 'enabled' : 'disabled'}`,
          description: newValue 
            ? 'You will now receive new message notifications' 
            : 'New message notifications are now turned off',
          className: newValue ? 'bg-green-500 text-white' : 'bg-slate-600 text-white',
        });
      }
    } catch (error) {
      console.error('Failed to toggle notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification settings',
        variant: 'destructive',
      });
    }
  }, [notificationsEnabled, toast]);

  const playNotificationSound = useCallback(() => {
    if (soundEnabled && notificationSoundRef.current) {
      notificationSoundRef.current.currentTime = 0;
      notificationSoundRef.current.play().catch(err => {
        console.log('Error playing notification sound:', err);
      });
    }
  }, [soundEnabled]);

  const fetchNotifications = useCallback(async () => {
    if (!session?.user) return;
    
    try {
      setLoading(true);
      const response = await axios.get('/api/notifications/unread');
      const newNotifications = response.data.newMessages || [];
      const currentStoredUnreadCount = prevUnreadCountRef.current;

      if (!notificationsEnabled && lastSeenTimestamp) {
        const filteredNotifications: Notification[] = newNotifications.filter((notification: Notification) => 
          new Date(notification.createdAt) <= lastSeenTimestamp!
        );
        
        setNotifications(filteredNotifications);
        setUnreadCount(filteredNotifications.length);
        prevUnreadCountRef.current = filteredNotifications.length;
      } else {
        prevUnreadCountRef.current = newNotifications.length;

        if (notificationsEnabled && newNotifications.length > currentStoredUnreadCount && currentStoredUnreadCount > 0) {
          const newCount = newNotifications.length - currentStoredUnreadCount;

          playNotificationSound();

          toast({
            title: `${newCount} new message${newCount > 1 ? 's' : ''}!`,
            description: 'You have new unread messages',
            className: 'bg-blue-500 text-white',
          });
        }
        
        setNotifications(newNotifications);
        setUnreadCount(newNotifications.length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [session, toast, playNotificationSound, notificationsEnabled, lastSeenTimestamp]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!session?.user) return;
    
    try {
      await axios.post('/api/notifications/mark-read', { notificationId });
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [session]);

  const markAllAsRead = useCallback(async () => {
    if (!session?.user) return;
    
    try {
      await axios.post('/api/notifications/mark-all-read');
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, [session]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (session?.user) {
      fetchNotifications();

      intervalRef.current = setInterval(fetchNotifications, 30000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [session, fetchNotifications]);

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    soundEnabled,
    toggleSound,
    notificationsEnabled, 
    toggleNotifications 
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}