import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const createSubscription = createAsyncThunk(
  'subscription/create',
  async (plan, thunkAPI) => {
    try {
      const response = await api.post(`/subscription/subscribe?plan=${plan}`);

      if (response.data?.data?.sessionUrl) {
        window.location.href = response.data.data.sessionUrl;
      }

      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

export const fetchMySubscriptions = createAsyncThunk(
  'subscription/fetchMe',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/subscription/recruiter');
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch subscriptions"
      );
    }
  }
);

export const fetchInvoices = createAsyncThunk(
  'subscription/fetchInvoices',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/subscription/invoices');
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch invoices"
      );
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  'subscription/cancel',
  async (id, thunkAPI) => {
    try {
      await api.put(`/subscription/${id}/cancel`);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Cancel failed"
      );
    }
  }
);

export const renewSubscription = createAsyncThunk(
  'subscription/renew',
  async (id, thunkAPI) => {
    try {
      const response = await api.put(`/subscription/${id}/renew`);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const fetchAdminAllInvoices = createAsyncThunk(
  'subscription/fetchAdminAll',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/subscription/admin/all-invoices');
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch all invoices");
    }
  }
);

const initialState = {
  active: [],
  invoices: [],
  adminInvoices: [],
  loading: false,
  error: null,
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchMySubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMySubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.active = action.payload || [];
      })
      .addCase(fetchMySubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload || [];
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(cancelSubscription.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.loading = false;
        const sub = state.active.find(
          (s) => s.subscriptionId === action.payload
        );
        if (sub) {
          sub.status = 'UNSUBSCRIBED';
        }
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createSubscription.pending, (state) => {
        state.loading = true;
      })
      .addCase(createSubscription.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAdminAllInvoices.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminAllInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.adminInvoices = action.payload || [];
      })
      .addCase(fetchAdminAllInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default subscriptionSlice.reducer;