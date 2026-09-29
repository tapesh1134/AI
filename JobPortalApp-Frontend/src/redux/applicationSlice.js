import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const submitApplication = createAsyncThunk('application/submit', async (appData, thunkAPI) => {
  try {
    const response = await api.post('/application/submit', appData);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

export const fetchMyApplications = createAsyncThunk('application/fetchMe', async (_, thunkAPI) => {
  try {
    const response = await api.get('/application/me');
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

export const fetchApplicationsByJob = createAsyncThunk('application/fetchByJob', async (jobId, thunkAPI) => {
  try {
    const response = await api.get(`/application/job/${jobId}`);
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

export const fetchApplicationsByStatus = createAsyncThunk('application/fetchByStatus', async (status, thunkAPI) => {
  try {
    const response = await api.get(`/application/status/${status}`);
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

export const updateApplicationStatus = createAsyncThunk('application/updateStatus', async ({ id, status }, thunkAPI) => {
  try {
    await api.put(`/application/${id}/status?status=${status}`);
    return { id, status };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

const applicationSlice = createSlice({
  name: 'applications',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyApplications.fulfilled, (state, action) => { state.list = action.payload; })
      .addCase(fetchApplicationsByJob.fulfilled, (state, action) => { state.list = action.payload; })
      .addCase(fetchApplicationsByStatus.fulfilled, (state, action) => { state.list = action.payload; })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        const app = state.list.find(a => a.applicationId === action.payload.id);
        if (app) app.status = action.payload.status;
      });
  }
});

export default applicationSlice.reducer;