import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const signupUser = createAsyncThunk('auth/signup', async (userData, thunkAPI) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data.message);
    }
});

export const loginUser = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      await api.post('/auth/login', userData, {
        withCredentials: true
      });

      const userRes = await api.post(
        '/auth/validate',
        {},
        { withCredentials: true }
      );

      return userRes.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Login failed'
      );
    }
  }
);
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchMe',
  async (_, thunkAPI) => {
    try {
      const response = await api.post(
        '/auth/validate',
        {},
        { withCredentials: true }
      );

      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue('Not authenticated');
    }
  }
);

export const updateUserRole = createAsyncThunk('auth/updateRole', async (role, thunkAPI) => {
    try {
        await api.put(`/auth/role?role=${role}`);
        return role;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data.message);
    }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
    try {
        await api.post('/auth/logout');
        return null;
    } catch (error) {
        return thunkAPI.rejectWithValue('Logout failed');
    }
});

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (email, thunkAPI) => {
    try {
        const response = await api.post(`/auth/forgot-password?email=${email}`);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to send OTP');
    }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async ({ email, otp, newPassword }, thunkAPI) => {
    try {
        const response = await api.post(`/auth/reset-password`, null, {
            params: { email, otp, newPassword }
        });
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to reset password');
    }
});


const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        selectedRole: localStorage.getItem('selectedRole') || null, // Persist selection during OAuth redirect
    },
    reducers: {
        setRole: (state, action) => {
            state.selectedRole = action.payload;
            localStorage.setItem('selectedRole', action.payload);
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            localStorage.removeItem('selectedRole');
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchCurrentUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload; // now clean UserCredential
            })
            .addCase(fetchCurrentUser.rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
            })
            .addCase(updateUserRole.fulfilled, (state, action) => {
                if (state.user) {
                    state.user.role = action.payload;
                }
                state.selectedRole = null;
                localStorage.removeItem("selectedRole");
            })
            .addCase(signupUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(signupUser.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(signupUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.selectedRole = null;
                localStorage.removeItem("selectedRole");
            });
    },
});

export const { setRole, logout } = authSlice.actions;
export default authSlice.reducer;