import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const scheduleInterview = createAsyncThunk(
    'interviews/schedule',
    async (data, thunkAPI) => {
        try {
            const response = await api.post('/interview/schedule', data);
            return response.data.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error?.response?.data?.message || 'Failed to schedule interview'
            );
        }
    }
);

export const fetchMyInterviews = createAsyncThunk(
    'interviews/fetchMe',
    async (_, thunkAPI) => {
        try {
            const response = await api.get('/interview/me');
            return response.data.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error?.response?.data?.message || 'Failed to fetch interviews'
            );
        }
    }
);

export const confirmInterview = createAsyncThunk(
    'interviews/confirm',
    async (id, thunkAPI) => {
        try {
            await api.put(`/interview/confirm/${id}`);
            return id;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error?.response?.data?.message || 'Failed to confirm interview'
            );
        }
    }
);

export const cancelInterview = createAsyncThunk(
    'interviews/cancel',
    async (id, thunkAPI) => {
        try {
            await api.put(`/interview/cancel/${id}`);
            return id;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error?.response?.data?.message || 'Failed to cancel interview'
            );
        }
    }
);

export const completeInterview = createAsyncThunk(
    'interviews/complete',
    async (id, thunkAPI) => {
        try {
            await api.put(`/interview/complete/${id}`);
            return id;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error?.response?.data?.message || 'Failed to complete interview'
            );
        }
    }
);

export const rescheduleInterview = createAsyncThunk(
    'interviews/reschedule',
    async ({ id, dateTime }, thunkAPI) => {
        try {
            const response = await api.put(
                `/interview/reschedule/${id}?rescheduledAt=${dateTime}`
            );
            return response.data.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error?.response?.data?.message);
        }
    }
);

export const fetchInterviewsByApplication = createAsyncThunk(
    'interviews/byApplication',
    async (applicationId, thunkAPI) => {
        try {
            const res = await api.get(`/interview/application/${applicationId}`);
            return res.data.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error?.response?.data?.message || 'Failed to fetch interviews'
            );
        }
    }
);

export const fetchRecruiterInterviews = createAsyncThunk(
    'interviews/fetchRecruiter',
    async (_, thunkAPI) => {
        try {
            const response = await api.get('/interview/recruiter/me');
            return response.data.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Failed');
        }
    }
);

const interviewSlice = createSlice({
    name: 'interviews',
    initialState: {
        list: [],
        loading: false,
        error: null,
    },
    reducers: {},

    extraReducers: (builder) => {
        builder
            .addCase(fetchMyInterviews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyInterviews.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload || [];
            })
            .addCase(fetchMyInterviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(scheduleInterview.fulfilled, (state, action) => {
                state.list.push(action.payload); // ✅ add new interview
            })
            .addCase(confirmInterview.fulfilled, (state, action) => {
                const interview = state.list.find(
                    (i) => i.interviewId === action.payload
                );
                if (interview) interview.status = 'CONFIRMED';
            })
            .addCase(cancelInterview.fulfilled, (state, action) => {
                const interview = state.list.find(
                    (i) => i.interviewId === action.payload
                );
                if (interview) interview.status = 'CANCELLED';
            })
            .addCase(completeInterview.fulfilled, (state, action) => {
                const interview = state.list.find(
                    (i) => i.interviewId === action.payload
                );
                if (interview) interview.status = 'COMPLETED';
            })
            .addCase(rescheduleInterview.fulfilled, (state, action) => {
                const updated = action.payload;
                const index = state.list.findIndex(
                    (i) => i.interviewId === updated.interviewId
                );

                if (index !== -1) {
                    state.list[index] = updated; // replace with updated data
                }
            })
            .addCase(fetchInterviewsByApplication.fulfilled, (state, action) => {
                state.list = [...state.list, ...action.payload];
            })
            .addCase(fetchRecruiterInterviews.fulfilled, (state, action) => {
                state.list = action.payload;
                state.loading = false;
            });
    },
});

export default interviewSlice.reducer;