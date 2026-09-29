import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { markAsRead, markAllRead, deleteNotification } from '../redux/NotificationSlice';
import { 
    Bell, Trash2, CheckCheck, Calendar, Info, 
    Briefcase, AlertCircle, Loader2, Clock, 
    ChevronRight, Inbox
} from 'lucide-react';

const NotificationsPage = () => {
    const { items, unreadCount, loading } = useSelector(state => state.notifications);
    const dispatch = useDispatch();
    const [timeFilter, setTimeFilter] = useState('ALL'); // 'ALL', 'TODAY', 'WEEK'

    // Logic for Filtering
    const filteredNotifications = useMemo(() => {
        const now = new Date();
        return items.filter(item => {
            const itemDate = new Date(item.createdAt);
            const diffInDays = (now - itemDate) / (1000 * 60 * 60 * 24);

            if (timeFilter === 'TODAY') return diffInDays <= 1;
            if (timeFilter === 'WEEK') return diffInDays <= 7;
            return true;
        });
    }, [items, timeFilter]);

    const getIcon = (message = "") => {
        const msg = message.toUpperCase();
        if (msg.includes('JOB') || msg.includes('APPLICATION')) return <Briefcase size={20} />;
        if (msg.includes('SYSTEM') || msg.includes('UPDATE')) return <Info size={20} />;
        return <AlertCircle size={20} />;
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-15 pb-15 px-4">
            <div className="max-w-3xl mx-auto">
                
                {/* HEADER SECTION */}
                <div className="flex flex-col gap-6 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Activity</h1>
                            <p className="text-sm font-medium text-slate-500 mt-1">
                                {unreadCount > 0 
                                    ? `You have ${unreadCount} unread updates.` 
                                    : "No new notifications at the moment."}
                            </p>
                        </div>
                        {items.length > 0 && (
                            <button 
                                onClick={() => dispatch(markAllRead())}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm active:scale-95"
                            >
                                <CheckCheck size={16} /> Mark all read
                            </button>
                        )}
                    </div>

                    {/* TIME FILTERS (Segmented Control) */}
                    <div className="flex p-1 bg-slate-200/50 rounded-2xl w-fit">
                        {['ALL', 'TODAY', 'WEEK'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setTimeFilter(tab)}
                                className={`px-6 py-2 rounded-xl text-[10px] font-bold tracking-widest transition-all ${
                                    timeFilter === tab 
                                    ? 'bg-white text-indigo-600 shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {tab === 'ALL' ? 'ALL TIME' : tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* CONTENT AREA */}
                {loading && items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Syncing Inbox...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-12 sm:p-20 text-center border border-slate-200 shadow-sm">
                        <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Inbox className="text-slate-200" size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No Notifications</h3>
                        <p className="text-slate-500 mt-2 text-sm font-medium max-w-xs mx-auto">
                            When you receive updates about your applications or system changes, they will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredNotifications.map((note) => (
                            <div 
                                key={note.notificationId}
                                className={`group relative bg-white p-5 rounded-3xl border transition-all duration-300 flex items-start gap-4 sm:gap-6 ${
                                    !note.read 
                                    ? 'border-indigo-100 bg-indigo-50/20 shadow-md shadow-indigo-500/5' 
                                    : 'border-slate-100 hover:border-slate-200'
                                }`}
                            >
                                {/* Icon Container */}
                                <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                    !note.read ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' : 'bg-slate-100 text-slate-400'
                                }`}>
                                    {getIcon(note.message)}
                                </div>

                                {/* Text & Meta */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${!note.read ? 'text-indigo-600' : 'text-slate-400'}`}>
                                                System Update
                                            </span>
                                            {!note.read && (
                                                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse" />
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => dispatch(deleteNotification(note.notificationId))}
                                            className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    
                                    <p className={`text-sm sm:text-base leading-relaxed mb-3 pr-2 ${
                                        !note.read ? 'text-slate-900 font-semibold' : 'text-slate-600 font-normal'
                                    }`}>
                                        {note.message}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                <Clock size={12} />
                                                {new Date(note.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                            </span>
                                            {!note.read && (
                                                <button 
                                                    onClick={() => dispatch(markAsRead(note.notificationId))}
                                                    className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                                                >
                                                    Mark as read <ChevronRight size={10} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;