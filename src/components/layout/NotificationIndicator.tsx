'use client';

import { useState, useEffect } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { Bell, CheckCircle2, ExternalLink, X, Clock, Info, ToggleLeft, ToggleRight } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format, isToday, isYesterday } from 'date-fns';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { Switch } from "@/components/ui/switch";

export function NotificationIndicator() {
    const {
        unreadCount,
        notifications,
        loading,
        markAsRead,
        markAllAsRead,
        soundEnabled,
        toggleSound,
        notificationsEnabled,
        toggleNotifications
    } = useNotifications();
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const { data: session } = useSession();

    const [animate, setAnimate] = useState(false);
    const [periodicShake, setPeriodicShake] = useState(false);

    useEffect(() => {
        if (session && unreadCount > 0 && notificationsEnabled) {
            setAnimate(true);
            const timer = setTimeout(() => setAnimate(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [unreadCount, session, notificationsEnabled]);

    useEffect(() => {
        if (session && unreadCount > 0 && !open && notificationsEnabled) {
            const interval = setInterval(() => {
                setPeriodicShake(true);
                setTimeout(() => setPeriodicShake(false), 500);
            }, 1200);
            return () => clearInterval(interval);
        }
    }, [unreadCount, open, session, notificationsEnabled]);

    if (!session) {
        return null;
    }

    interface Notification {
        _id: string;
        isRead: boolean;
        content: string;
        createdAt: string;
    }

    const handleNotificationClick = (notificationId: string): void => {
        markAsRead(notificationId);
        router.push('/dashboard');
        setOpen(false);
    };

    const handleOpenNotifications = () => {
        setOpen(true);
        const silentAudio = new Audio('/sounds/notificationSound.wav');
        silentAudio.volume = 0.1;
        silentAudio.play().catch(e => console.log('Silent audio play failed, may need user interaction first'));
    };

    const formatNotificationTime = (date: string): string => {
        const notificationDate = new Date(date);
        if (isToday(notificationDate)) {
            return `Today, ${format(notificationDate, 'h:mm a')}`;
        } else if (isYesterday(notificationDate)) {
            return `Yesterday, ${format(notificationDate, 'h:mm a')}`;
        } else {
            return format(notificationDate, 'MMM d, h:mm a');
        }
    };

    return (
        <Popover open={open} onOpenChange={(isOpen) => {
            if (isOpen) {
                handleOpenNotifications();
            } else {
                setOpen(false);
            }
        }}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 md:p-2 hover:bg-slate-600/30 bg-slate-800/40 md:bg-transparent transition-colors rounded-full fixed left-4 md:left-auto md:right-4 md:mt-2 mt-1.5 z-50 shadow-lg md:shadow-none shadow-black/20"
                >
                    <motion.div
                        animate={
                            animate
                                ? {
                                    rotate: [0, -8, 8, -5, 5, -3, 3, 0]
                                }
                                : periodicShake
                                    ? {
                                        rotate: [0, -3, 3, -2, 2, 0]
                                    }
                                    : {}
                        }
                        transition={{
                            duration: animate ? 0.7 : 0.5,
                            ease: "easeInOut",
                            times: animate
                                ? [0, 0.2, 0.4, 0.6, 0.7, 0.8, 0.9, 1]
                                : [0, 0.2, 0.4, 0.6, 0.8, 1]
                        }}
                    >
                        <motion.div
                            animate={unreadCount > 0 && !open && notificationsEnabled ? {
                                scale: [1, 1.08, 1],
                                opacity: [1, 0.9, 1]
                            } : {}}
                            transition={{
                                repeat: Infinity,
                                repeatType: "reverse",
                                duration: 2.5,
                                ease: "easeInOut",
                                times: [0, 0.5, 1]
                            }}
                        >
                            <Bell className={`h-6 w-6 md:h-5 md:w-5 ${unreadCount > 0 && !open && notificationsEnabled ? 'text-blue-300' : 'text-white'}`} />
                        </motion.div>
                    </motion.div>

                    {unreadCount > 0 && notificationsEnabled && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{
                                scale: 1,
                                y: [0, -1, 0],
                                transition: {
                                    scale: { duration: 0.3, ease: "backOut" },
                                    y: {
                                        repeat: Infinity,
                                        duration: 2,
                                        ease: "easeInOut",
                                        repeatType: "reverse"
                                    }
                                }
                            }}
                            className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 md:h-5 md:w-5 flex items-center justify-center shadow-lg shadow-red-500/30"
                        >
                            {unreadCount}
                        </motion.span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className="w-[calc(100vw-24px)] max-w-96 p-0 bg-gradient-to-b from-slate-800 to-slate-900 border-white/10 text-white shadow-2xl rounded-xl overflow-hidden backdrop-blur-sm"
                sideOffset={8}
                align="start"
                alignOffset={-8}
            >
                <div className="p-3 md:p-4 flex justify-between items-center bg-slate-800/50 backdrop-blur-sm">
                    <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Bell className="h-4 w-4 text-blue-400" /> Notifications
                        </h3>
                        <p className="text-sm text-white/70">
                            {unreadCount === 0 ? 'All caught up!' : `${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}`}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={markAllAsRead}
                                className="text-xs border-white/20 text-black/90 hover:bg-blue-500/20 hover:border-blue-400/30 hover:text-blue-400 transition-colors mt-4 mr-1"
                            >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                                Mark all read
                            </Button>
                        )}
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpen(false)}
                        className="absolute right-2 top-2 h-6 w-6 p-0 rounded-full hover:bg-white/10"
                    >
                        <X className="h-3.5 w-3.5 text-white/70 mb-[3px]" />
                    </Button>
                </div>

                <div className="p-2 px-3 md:px-4 bg-slate-800/80 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <p className="text-sm text-white/80">Receive new notifications</p>
                        {!notificationsEnabled && (
                            <div className="flex items-center gap-1 bg-slate-700/50 px-2 py-0.5 rounded-full">
                                <Info className="h-3 w-3 text-amber-400" />
                                <span className="text-[10px] font-medium text-amber-400">Paused</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={notificationsEnabled}
                            onCheckedChange={toggleNotifications}
                            className="data-[state=checked]:bg-green-500"
                        />
                        <span className="text-xs font-medium text-slate-300">
                            {notificationsEnabled ? 'On' : 'Off'}
                        </span>
                    </div>
                </div>

                <Separator className="bg-white/10" />

                {!notificationsEnabled && (
                    <div className="bg-amber-500/10 p-2 md:p-3 flex items-center gap-2">
                        <Info className="h-4 w-4 text-amber-400 flex-shrink-0" />
                        <p className="text-xs text-amber-300">
                            New message notifications are paused. You'll still see existing notifications.
                        </p>
                    </div>
                )}

                <div className="max-h-[50vh] md:max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                    {loading ? (
                        <div className="p-8 md:p-12 text-center text-white/50 flex flex-col items-center">
                            <div className="relative h-10 w-10">
                                <div className="animate-ping absolute inset-0 rounded-full bg-blue-400 opacity-20"></div>
                                <div className="animate-spin relative h-10 w-10 border-2 border-white/20 border-t-blue-400 rounded-full"></div>
                            </div>
                            <p className="mt-4 font-medium">Loading notifications...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="py-12 md:py-16 px-4 md:px-8 text-center text-white/50 flex flex-col items-center">
                            <div className="relative p-4 bg-slate-700/30 rounded-full mb-4">
                                <Bell className="h-12 w-12 text-white/30" />
                            </div>
                            <p className="text-lg font-medium mb-2">No notifications yet</p>
                            <p className="text-sm text-white/50 max-w-xs">
                                We'll notify you when there are new messages or activities
                            </p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {notifications.map((notification, index) => (
                                <motion.div
                                    key={notification._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ delay: index * 0.8 }}
                                    className={`group p-3 md:p-4 hover:bg-white/10 transition-all cursor-pointer border-b border-white/10 ${!notification.isRead ? 'bg-blue-500/5' : ''
                                        }`}
                                    onClick={() => handleNotificationClick(notification._id)}
                                >
                                    <div className="flex gap-2 md:gap-3 items-start">
                                        <div
                                            className={`${!notification.isRead
                                                ? 'bg-gradient-to-br from-blue-500/40 to-blue-600/40'
                                                : 'bg-slate-700/30'
                                                } p-2 rounded-full transition-colors group-hover:scale-110 duration-200`}
                                        >
                                            <Bell className={`h-4 w-4 ${!notification.isRead ? 'text-blue-400' : 'text-slate-400'
                                                } group-hover:text-blue-300`} />
                                        </div>

                                        <div className="flex-1 space-y-1">
                                            <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                                                <p className={`text-sm ${!notification.isRead ? 'font-semibold text-white' : 'font-medium text-white/90'
                                                    }`}>
                                                    New message received
                                                </p>
                                                <div className="flex items-center text-xs text-white/50 mt-1 md:mt-0">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {formatNotificationTime(notification.createdAt)}
                                                </div>
                                            </div>

                                            <p className="text-sm line-clamp-2 text-white/80 group-hover:text-white transition-colors">
                                                {notification.content}
                                            </p>

                                            <div className="flex items-center justify-between pt-1">
                                                {!notification.isRead && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="flex items-center gap-1 bg-blue-500/20 px-2 py-0.5 rounded-full"
                                                    >
                                                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                                                        <span className="text-[10px] font-medium text-blue-400">New</span>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                <Separator className="bg-white/10" />

                <div className="p-2 md:p-3 bg-slate-800/30 flex space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs md:text-sm text-black/80 border-white/20 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-400/30 transition-colors flex items-center justify-center gap-1 md:gap-2"
                        onClick={() => {
                            setOpen(false);
                            if (pathname !== '/dashboard') {
                                router.push('/dashboard');
                            }
                        }}
                    >
                        {pathname === '/dashboard' ? (
                            <>Close</>
                        ) : (
                            <>
                                View all
                                <ExternalLink className="h-3 w-3 md:h-3.5 md:w-3.5" />
                            </>
                        )}
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs md:text-sm text-white/70 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        onClick={() => setOpen(false)}
                    >
                        Dismiss
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}