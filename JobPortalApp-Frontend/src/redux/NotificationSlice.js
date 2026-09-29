import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchNotifications = createAsyncThunk(
    'notifications/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/notifications', {
                withCredentials: true
            });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Failed to fetch');
        }
    }
);

export const fetchUnreadNotifications = createAsyncThunk(
    'notifications/fetchUnread',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/notifications/unread', {
                withCredentials: true
            });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Failed to fetch unread');
        }
    }
);

export const fetchUnreadCount = createAsyncThunk(
    'notifications/fetchCount',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/notifications/count', {
                withCredentials: true
            });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Failed to fetch count');
        }
    }
);

export const markAsRead = createAsyncThunk(
    'notifications/markRead',
    async (id, { rejectWithValue }) => {
        try {
            await api.put(`/notifications/${id}/read`, {}, {
                withCredentials: true
            });
            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Failed to mark read');
        }
    }
);

export const markAllRead = createAsyncThunk(
    'notifications/markAllRead',
    async (_, { rejectWithValue }) => {
        try {
            await api.put('/notifications/read-all', {}, {
                withCredentials: true
            });
            return true;
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Failed to mark all read');
        }
    }
);

export const deleteNotification = createAsyncThunk(
    'notifications/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/notifications/${id}`, {
                withCredentials: true
            });
            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Delete failed');
        }
    }
);

const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
        items: [],
        unreadCount: 0,
        loading: false,
        error: null
    },
    reducers: {
        addNotification: (state, action) => {
            const notif = action.payload;
            const exists = state.items.some(
                n => n.notificationId === notif.notificationId
            );

            if (!exists) {
                state.items.unshift(notif);
                if (!notif.read) state.unreadCount += 1;
            }
        },
        clearUnreadCount: (state) => {
            state.unreadCount = 0;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                const incoming = action.payload || [];

                incoming.forEach(notif => {
                    const exists = state.items.some(
                        n => n.notificationId === notif.notificationId
                    );

                    if (!exists) state.items.push(notif);
                });
                state.items.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );

                state.unreadCount = state.items.filter(n => !n.read).length;
                state.loading = false;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                state.unreadCount = action.payload;
            })
            .addCase(markAsRead.fulfilled, (state, action) => {
                const note = state.items.find(
                    n => n.notificationId === action.payload
                );
                if (note && !note.read) {
                    note.read = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            .addCase(markAllRead.fulfilled, (state) => {
                state.items.forEach(n => n.read = true);
                state.unreadCount = 0;
            })
            .addCase(deleteNotification.fulfilled, (state, action) => {
                state.items = state.items.filter(
                    n => n.notificationId !== action.payload
                );
            });
    }
});

export const { addNotification, clearUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer;