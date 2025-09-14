import React, { useState, useEffect, useCallback } from 'react';
import { Bell, MessageSquare, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Notification } from '@/api/entities';
import { User } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatDistanceToNow } from 'date-fns';

function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [senders, setSenders] = useState({});
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const unreadNotifications = await Notification.filter({ is_read: false }, '-created_date');
            setNotifications(unreadNotifications);

            if (unreadNotifications.length > 0) {
                const senderIds = [...new Set(unreadNotifications.map(n => n.sender_id))];
                const usersData = await User.filter({ id: { '$in': senderIds } });
                const sendersMap = usersData.reduce((acc, user) => {
                    acc[user.id] = user;
                    return acc;
                }, {});
                setSenders(sendersMap);
            }
        } catch (error) {
            // It's okay if it fails, e.g., for non-logged-in users.
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const handleNotificationClick = async (notification) => {
        try {
            await Notification.update(notification.id, { is_read: true });
            setIsOpen(false);
            navigate(createPageUrl(`JobDetails?id=${notification.job_id}`));
            fetchNotifications(); // Refresh list immediately
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-800">
                    <Bell className="w-5 h-5" />
                    {notifications.length > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b">
                    <h3 className="font-semibold text-slate-800">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-sm text-slate-500">Loading...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                            <p className="text-sm text-slate-500">You're all caught up!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {notifications.map(notification => {
                                const sender = senders[notification.sender_id];
                                return (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className="p-3 hover:bg-slate-50 cursor-pointer"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 mt-0.5 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                {notification.type === 'mention' && <MessageSquare className="w-4 h-4 text-slate-500" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-slate-700">
                                                    <span className="font-semibold text-slate-800">{sender?.full_name || 'Someone'}</span> {notification.content}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}

export default NotificationBell;