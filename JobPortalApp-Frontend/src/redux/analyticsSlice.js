import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '../services/api';

export const fetchRecruiterAnalytics = createAsyncThunk(
    'analytics/fetchRecruiter',
    async (recruiterId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/analytics/recruiter/${recruiterId}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchAdminAnalytics = createAsyncThunk(
    'analytics/fetchAdmin',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(`/analytics/admin`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const analyticsSlice = createSlice({
    name: 'analytics',
    initialState: {
        data: {
            totalJobs: 0,
            totalApplications: 0,
            shortlistedCount: 0,
            offeredCount: 0,
            rejectedCount: 0
        },
        loading: false,
        error: null
    },
    reducers: {
        clearAnalytics: (state) => {
            state.data = { totalJobs: 0, totalApplications: 0, shortlistedCount: 0, offeredCount: 0, rejectedCount: 0 };
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRecruiterAnalytics.pending, (state) => { state.loading = true; })
            .addCase(fetchRecruiterAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchAdminAnalytics.pending, (state) => { state.loading = true; })
            .addCase(fetchAdminAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchAdminAnalytics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;