// Authentication API service
import axios from 'axios';

// Type definitions for Vite env
interface ImportMetaEnv {
  VITE_API_URL?: string;
  MODE?: string;
}

interface ImportMeta {
  env: ImportMetaEnv;
}

// Base URL configuration
// - In production: Use root path (backend serves from same origin)
// - In development: Use localhost:5000 (backend runs separately)
// - Custom: Use VITE_API_URL env variable if set
const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'production' ? '' : 'http://localhost:5000');

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on unauthorized
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');

      // Only redirect if not already on login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Authentication API methods
export const authAPI = {
  // User authentication
  async login(credentials: any) {
    try {
      const response = await api.post('/api/auth/login', credentials);
      const { token, user } = response.data;

      // Store auth data in localStorage only
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return { success: true, data: { token, user } };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  },

  async register(userData: any) {
    try {
      const response = await api.post('/api/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  },

  async logout() {
    try {
      // Call backend logout endpoint if available
      try {
        await api.post('/api/auth/logout');
      } catch (error: any) {
        // Continue with local cleanup even if backend call fails
        console.warn('Backend logout failed, continuing with local cleanup:', error.message);
      }

      // Clear local auth data from localStorage only
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: 'Logout failed' };
    }
  },

  async verifyToken() {
    try {
      const response = await api.get('/api/auth/verify');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: 'Token verification failed' };
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/api/user/me');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: 'Failed to get user data' };
    }
  }
};

// Session API methods
export const sessionAPI = {
  async createSession(sessionData) {
    try {
      const response = await api.post('/api/session/create', sessionData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to create session' 
      };
    }
  },

  async joinSession(sessionId, userData) {
    try {
      const response = await api.post('/api/session/join', { sessionId, ...userData });
      return { success: true, data: response.data.session };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to join session' 
      };
    }
  },

  async getSession(sessionId) {
    try {
      const response = await api.get(`/api/session/${sessionId}`);
      return { success: true, data: response.data.session };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to get session' 
      };
    }
  },

  async getUserSessions() {
    try {
      const response = await api.get('/api/session/my');
      return { success: true, data: response.data.sessions || response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to get sessions' };
    }
  },

  async getActiveSessions() {
    try {
      const response = await api.get('/api/session/active');
      return { success: true, data: response.data.sessions || response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to get active sessions' };
    }
  },

  async getRecentSessions() {
    try {
      const response = await api.get('/api/session/recent');
      return { success: true, data: response.data.sessions || response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to get recent sessions' };
    }
  },

  async endSession(sessionId) {
    try {
      const response = await api.post('/api/session/end', { sessionId });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to end session' };
    }
  },

  async leaveSession(sessionId) {
    try {
      const response = await api.post('/api/session/leave', { sessionId });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to leave session' };
    }
  },


  async getAllSessions() {
    try {
      const response = await api.get('/api/session/all');
      return { success: true, data: response.data.sessions };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to get all sessions' };
    }
  }
};

// Recording API methods
export const recordingAPI = {
  async uploadRecording(file, metadata) {
    try {
      const formData = new FormData();
      formData.append('recording', file);
      formData.append('metadata', JSON.stringify(metadata));

      const response = await api.post('/api/recordings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // You can emit progress events here
          console.log(`Upload progress: ${progress}%`);
        }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Upload failed' 
      };
    }
  },

  async getRecordings() {
    try {
      const response = await api.get('/api/recordings');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: 'Failed to get recordings' };
    }
  },

  async getRecording(id) {
    try {
      const response = await api.get(`/api/recordings/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: 'Failed to get recording' };
    }
  },

  async deleteRecording(id) {
    try {
      const response = await api.delete(`/api/recordings/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: 'Failed to delete recording' };
    }
  }
};

// Project API methods
export const projectAPI = {
  async getProjects() {
    try {
      const response = await api.get('/api/projects');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: 'Failed to get projects' };
    }
  },

  async createProject(projectData) {
    try {
      const response = await api.post('/api/projects', projectData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create project' 
      };
    }
  },

  async updateProject(id, projectData) {
    try {
      const response = await api.put(`/api/projects/${id}`, projectData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: 'Failed to update project' };
    }
  },

  async deleteProject(id) {
    try {
      const response = await api.delete(`/api/projects/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: 'Failed to delete project' };
    }
  }
};

// Health check API
export const healthAPI = {
  async checkHealth() {
    try {
      const response = await api.get('/health');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: 'Health check failed' };
    }
  },

  async getDetailedHealth() {
    try {
      const response = await api.get('/health/detailed');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: 'Detailed health check failed' };
    }
  }
};

export default api;