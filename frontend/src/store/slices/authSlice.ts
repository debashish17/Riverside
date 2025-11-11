// Authentication state slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../utils/api';
import toast from 'react-hot-toast';

// Async thunks for auth actions
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const result = await authAPI.login(credentials);
      if (result.success) {
        toast.success('Login successful!');
        return result.data;
      } else {
        toast.error(result.error);
        return rejectWithValue(result.error);
      }
    } catch (error) {
      toast.error('Login failed');
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const result = await authAPI.register(userData);
      if (result.success) {
        toast.success('Registration successful!');
        return result.data;
      } else {
        toast.error(result.error);
        return rejectWithValue(result.error);
      }
    } catch (error) {
      toast.error('Registration failed');
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const result = await authAPI.logout();
      if (result.success) {
        toast.success('Logged out successfully');
        return true;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyToken = createAsyncThunk(
  'auth/verify',
  async (_, { rejectWithValue }) => {
    try {
      const result = await authAPI.verifyToken();
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const result = await authAPI.getCurrentUser();
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('auth_token') || null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  loginForm: {
    username: '',
    password: ''
  },
  registerForm: {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateLoginForm: (state, action) => {
      state.loginForm = { ...state.loginForm, ...action.payload };
    },
    updateRegisterForm: (state, action) => {
      state.registerForm = { ...state.registerForm, ...action.payload };
    },
    clearForms: (state) => {
      state.loginForm = { username: '', password: '' };
      state.registerForm = { username: '', email: '', password: '', confirmPassword: '' };
    },
    setAuthFromStorage: (state) => {
      const token = localStorage.getItem('auth_token');
      const user = localStorage.getItem('user');
      if (token && user) {
        try {
          state.token = token;
          state.user = JSON.parse(user);
          state.isAuthenticated = true;
          state.isLoading = false;
        } catch (error) {
          // Clear invalid stored data
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
        }
      } else {
        state.isAuthenticated = false;
        state.isLoading = false;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      })
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // Don't auto-login after registration
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.isLoading = false;
        state.error = null;
        // Clear forms
        state.loginForm = { username: '', password: '' };
        state.registerForm = { username: '', email: '', password: '', confirmPassword: '' };
      })
      // Verify token cases
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(verifyToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      // Get current user cases
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  }
});

export const { 
  clearError, 
  updateLoginForm, 
  updateRegisterForm, 
  clearForms,
  setAuthFromStorage 
} = authSlice.actions;

export default authSlice.reducer;