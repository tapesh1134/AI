import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchJobs = createAsyncThunk('jobs/fetchAll', async (_, thunkAPI) => {
    try {
        const response = await api.get('/jobs');
        return response.data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data.message);
    }
});

export const searchJobs = createAsyncThunk('jobs/search', async (params, thunkAPI) => {
    try {
        const response = await api.get('/jobs/search', { params });
        return response.data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data.message);
    }
});

export const fetchJobById = createAsyncThunk('jobs/fetchById', async (jobId, thunkAPI) => {
    try {
        const response = await api.get(`/jobs/${jobId}`);
        return response.data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data.message);
    }
});

export const postJob = createAsyncThunk('jobs/post', async (jobData, thunkAPI) => {
    try {
        const response = await api.post('/jobs/add', jobData);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data.message);
    }
});

export const deleteJob = createAsyncThunk('jobs/delete', async (jobId, thunkAPI) => {
    try {
        await api.delete(`/jobs/${jobId}`);
        return jobId;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data.message);
    }
});

export const updateJobDetails = createAsyncThunk('jobs/update', async ({ jobId, jobData }, thunkAPI) => {
    try {
        const response = await api.put(`/jobs/${jobId}`, jobData);
        return response.data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data.message);
    }
});

const jobSlice = createSlice({
    name: 'jobs',
    initialState: {
        list: [],
        selectedJob: null,
        loading: false,
        error: null,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchJobById.pending, (state) => { state.loading = true; })
            .addCase(fetchJobById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedJob = action.payload;
            })
            .addCase(fetchJobs.pending, (state) => { state.loading = true; })
            .addCase(fetchJobs.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(searchJobs.fulfilled, (state, action) => {
                state.list = action.payload;
                state.loading = false;
            })
            .addCase(postJob.pending, (state) => { state.loading = true; })
            .addCase(updateJobDetails.fulfilled, (state, action) => {
                const updatedJob = action.payload;
                const index = state.list.findIndex(
                    (job) => job.jobId === updatedJob.jobId
                );
                if (index !== -1) {
                    state.list[index] = updatedJob; // 🔥 update instantly
                }
            })
            .addCase(deleteJob.fulfilled, (state, action) => {
                const deletedId = action.meta.arg;
                state.list = state.list.filter(
                    (job) => job.jobId !== deletedId
                );
            });
    },
});

export default jobSlice.reducer;