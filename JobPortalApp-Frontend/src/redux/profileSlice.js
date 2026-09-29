import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchProfile = createAsyncThunk(
    'profile/fetch',
    async (email, thunkAPI) => {
        const state = thunkAPI.getState();
        const userRole = state.auth?.user?.role;
        if (userRole === 'ADMIN') {
            return null;
        }
        try {
            const response = await api.get(`/users/email/${email}`);
            return response.data.data;
        } catch (error) {
            return null;
        }
    }
);

export const createProfile = createAsyncThunk('profile/create', async ({ role, profileData }, thunkAPI) => {
    try {
        const endpoint = role === 'CANDIDATE' ? '/users/candidate/add' : '/users/recruiter/add';
        const response = await api.post(endpoint, profileData);
        return response.data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data.message);
    }
});

export const updateProfile = createAsyncThunk('profile/update', async (profileData, thunkAPI) => {
    try {
        const response = await api.put('/users/update', profileData);
        return response.data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data.message);
    }
});

export const fetchRecruiterPublicProfile = createAsyncThunk(
    'profile/fetchPublic',
    async (email, thunkAPI) => {
        try {
            const response = await api.get(`/users/email/${email}`);
            return response.data.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data.message);
        }
    }
);

export const fetchAllProfiles = createAsyncThunk(
    'profile/fetchAll',
    async (_, thunkAPI) => {
        try {
            const response = await api.get('/users/');
            return response.data.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data.message);
        }
    }
);

export const adminDeleteProfile = createAsyncThunk(
    'profile/delete',
    async (userId, thunkAPI) => {
        try {
            await api.delete(`/users/${userId}`);
            return userId; // Return ID to remove from local state
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data.message);
        }
    }
);

const profileSlice = createSlice({
    name: 'profile',
    initialState: {
        data: null,
        loading: false,
        error: null,
        profileExists: null,
    },
    reducers: {
        clearProfile: (state) => {
            state.data = null;
            state.profileExists = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.data = action.payload;
                state.profileExists = !!action.payload?.fullName;
                state.loading = false;
            })
            .addCase(fetchProfile.rejected, (state) => {
                state.data = null;
                state.profileExists = false;
                state.loading = false;
            })
            .addCase(createProfile.fulfilled, (state, action) => {
                state.data = action.payload;
                state.profileExists = true;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.data = action.payload;
            })
            .addCase(fetchRecruiterPublicProfile.fulfilled, (state, action) => {
                state.viewedProfile = action.payload; // Store in a separate key
            })
            .addCase(fetchAllProfiles.fulfilled, (state, action) => {
                state.allProfiles = action.payload;
                state.loading = false;
            })
            .addCase(adminDeleteProfile.fulfilled, (state, action) => {
                state.allProfiles = state.allProfiles.filter(p => p.profileId !== action.payload);
            });
    },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;