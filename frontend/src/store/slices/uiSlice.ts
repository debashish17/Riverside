// UI state slice for global UI state management
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Sidebar and navigation
  sidebarOpen: true,
  currentPage: 'dashboard',
  
  // Modals and dialogs
  modals: {
    createSession: false,
    joinSession: false,
    createProject: false,
    uploadRecording: false,
    settings: false,
    profile: false,
    shareSession: false,
    recordingDetails: false,
    deleteConfirm: false
  },
  
  // Loading states
  pageLoading: false,
  globalLoading: false,
  
  // Notifications and toasts
  notifications: [],
  
  // Theme and appearance
  theme: localStorage.getItem('theme') || 'light',
  
  // Layout settings
  layout: {
    compactMode: false,
    showParticipantNames: true,
    gridLayout: 'auto',
    videoQuality: 'high'
  },
  
  // Connection status
  connectionStatus: 'connected', // connected, connecting, disconnected, error
  
  // WebRTC settings
  mediaSettings: {
    videoEnabled: true,
    audioEnabled: true,
    cameraDeviceId: '',
    microphoneDeviceId: '',
    speakerDeviceId: '',
    videoResolution: '720p',
    framerate: 30,
    noiseSuppression: true,
    echoCancellation: true
  },
  
  // Available devices
  devices: {
    cameras: [],
    microphones: [],
    speakers: []
  },
  
  // Recording settings
  recordingSettings: {
    autoRecord: false,
    recordAudio: true,
    recordVideo: true,
    recordScreen: false,
    quality: 'high',
    format: 'webm'
  },
  
  // Keyboard shortcuts
  shortcuts: {
    muteAudio: 'Space',
    toggleVideo: 'Ctrl+D',
    shareScreen: 'Ctrl+Shift+S',
    startRecording: 'Ctrl+R',
    leaveSession: 'Ctrl+L'
  },
  
  // Performance monitoring
  performance: {
    fps: 0,
    bitrate: 0,
    latency: 0,
    packetLoss: 0
  },
  
  // Error handling
  errors: [],
  
  // Search and filters
  globalSearch: '',
  
  // Drag and drop
  dragOver: false,
  
  // Full screen
  isFullscreen: false,
  
  // Developer mode
  devMode: process.env.NODE_ENV === 'development'
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Sidebar and navigation
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    
    // Modal management
    openModal: (state, action) => {
      const modalName = action.payload;
      if (state.modals.hasOwnProperty(modalName)) {
        state.modals[modalName] = true;
      }
    },
    closeModal: (state, action) => {
      const modalName = action.payload;
      if (state.modals.hasOwnProperty(modalName)) {
        state.modals[modalName] = false;
      }
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(modal => {
        state.modals[modal] = false;
      });
    },
    
    // Loading states
    setPageLoading: (state, action) => {
      state.pageLoading = action.payload;
    },
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload;
    },
    
    // Notifications
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...action.payload
      };
      state.notifications.unshift(notification);
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Theme
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleTheme: (state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      state.theme = newTheme;
      localStorage.setItem('theme', newTheme);
    },
    
    // Layout settings
    updateLayout: (state, action) => {
      state.layout = { ...state.layout, ...action.payload };
    },
    
    // Connection status
    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload;
    },
    
    // Media settings
    updateMediaSettings: (state, action) => {
      state.mediaSettings = { ...state.mediaSettings, ...action.payload };
    },
    
    // Devices
    setDevices: (state, action) => {
      state.devices = action.payload;
    },
    updateDevices: (state, action) => {
      state.devices = { ...state.devices, ...action.payload };
    },
    
    // Recording settings
    updateRecordingSettings: (state, action) => {
      state.recordingSettings = { ...state.recordingSettings, ...action.payload };
    },
    
    // Shortcuts
    updateShortcuts: (state, action) => {
      state.shortcuts = { ...state.shortcuts, ...action.payload };
    },
    
    // Performance
    updatePerformance: (state, action) => {
      state.performance = { ...state.performance, ...action.payload };
    },
    
    // Error handling
    addError: (state, action) => {
      const error = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...action.payload
      };
      state.errors.unshift(error);
      // Keep only last 20 errors
      if (state.errors.length > 20) {
        state.errors = state.errors.slice(0, 20);
      }
    },
    removeError: (state, action) => {
      state.errors = state.errors.filter(e => e.id !== action.payload);
    },
    clearErrors: (state) => {
      state.errors = [];
    },
    
    // Search
    setGlobalSearch: (state, action) => {
      state.globalSearch = action.payload;
    },
    
    // Drag and drop
    setDragOver: (state, action) => {
      state.dragOver = action.payload;
    },
    
    // Fullscreen
    setFullscreen: (state, action) => {
      state.isFullscreen = action.payload;
    },
    toggleFullscreen: (state) => {
      state.isFullscreen = !state.isFullscreen;
    },
    
    // Reset UI state
    resetUI: (state) => {
      return {
        ...initialState,
        theme: state.theme, // Preserve theme
        mediaSettings: state.mediaSettings, // Preserve media settings
        shortcuts: state.shortcuts, // Preserve shortcuts
        recordingSettings: state.recordingSettings // Preserve recording settings
      };
    }
  }
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setCurrentPage,
  openModal,
  closeModal,
  closeAllModals,
  setPageLoading,
  setGlobalLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  setTheme,
  toggleTheme,
  updateLayout,
  setConnectionStatus,
  updateMediaSettings,
  setDevices,
  updateDevices,
  updateRecordingSettings,
  updateShortcuts,
  updatePerformance,
  addError,
  removeError,
  clearErrors,
  setGlobalSearch,
  setDragOver,
  setFullscreen,
  toggleFullscreen,
  resetUI
} = uiSlice.actions;

export default uiSlice.reducer;