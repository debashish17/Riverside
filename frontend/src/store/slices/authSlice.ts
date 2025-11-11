// Authentication state slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../utils/api';
import toast from 'react-hot-toast';

// Types
export interface User {
  id: string;
  username: string;
  email?: string;
  // add other user fields as needed
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginForm: {
    username: string;
    password: string;
  };
  registerForm: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
}

// Async thunks for auth actions
export const loginUser = createAsyncThunk<
  { user: User; token: string },
  { username: string; password: string },
  { rejectValue: string }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const result = await authAPI.login(credentials);
      if (result.success && result.data && result.data.user && result.data.token) {
        toast.success('Login successful!');
        return { user: result.data.user, token: result.data.token };
      } else {
        toast.error(result.error ?? 'Unknown error');
        return rejectWithValue(result.error ?? 'Unknown error');
      }
    } catch (error) {
      toast.error('Login failed');
      return rejectWithValue((error as Error).message);
    }
  }
);

export const registerUser = createAsyncThunk<
  any,
  { username: string; email: string; password: string; confirmPassword: string },
  { rejectValue: string }
>(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const result = await authAPI.register(userData);
      if (result.success) {
        toast.success('Registration successful!');
        return result.data;
      } else {
        toast.error(result.error ?? 'Unknown error');
        return rejectWithValue(result.error ?? 'Unknown error');
      }
    } catch (error) {
      toast.error('Registration failed');
      return rejectWithValue((error as Error).message);
    }
  }
);

export const logoutUser = createAsyncThunk<
  boolean,
  void,
  { rejectValue: string }
>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const result = await authAPI.logout();
      if (result.success) {
        toast.success('Logged out successfully');
        return true;
      } else {
        return rejectWithValue(result.error ?? 'Unknown error');
      }
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const verifyToken = createAsyncThunk<
  { user: User },
  void,
  { rejectValue: string }
>(
  'auth/verify',
  async (_, { rejectWithValue }) => {
    try {
      const result = await authAPI.verifyToken();
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.error ?? 'Unknown error');
      }
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const getCurrentUser = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const result = await authAPI.getCurrentUser();
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.error ?? 'Unknown error');
      }
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const initialState: AuthState = {
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
    updateLoginForm: (state, action: { payload: Partial<AuthState['loginForm']> }) => {
      state.loginForm = { ...state.loginForm, ...action.payload };
    },
    updateRegisterForm: (state, action: { payload: Partial<AuthState['registerForm']> }) => {
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
        state.user = action.payload?.user ?? null;
        state.token = action.payload?.token ?? null;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = typeof action.payload === 'string' ? action.payload : null;
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
        state.error = typeof action.payload === 'string' ? action.payload : null;
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
        state.user = action.payload?.user ?? null;
      })
      .addCase(verifyToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      // Get current user cases
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload ?? null;
        state.isAuthenticated = !!action.payload;
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