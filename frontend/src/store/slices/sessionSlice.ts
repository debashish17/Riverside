// Session state slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sessionAPI } from '../../utils/api';
import toast from 'react-hot-toast';

// Types
export interface Participant {
  id: string;
  username: string;
  // add other participant fields as needed
}

export interface Session {
  id: string;
  title: string;
  name?: string;
  description?: string;
  isPrivate?: boolean;
  maxParticipants?: number;
  status?: string;
  isOwner?: boolean;
  owner?: string;
  members?: Array<{ id: string; username: string; avatar?: string }>;
  createdAt?: string;
  endedAt?: string;
  // add other session fields as needed
}

export interface SessionState {
  currentSession: Session | null;
  userSessions: Session[];
  activeSessions: Session[];
  recentSessions: Session[];
  allSessions: Session[];
  isInSession: boolean;
  isCreating: boolean;
  isJoining: boolean;
  isLoading: boolean;
  error: string | null;
  participants: Participant[];
  sessionForm: {
    title: string;
    description: string;
    isPrivate: boolean;
    maxParticipants: number;
  };
  joinForm: {
    sessionId: string;
    displayName: string;
  };
  localStream: any;
  remoteStreams: Record<string, any>;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  recordingDuration: number;
}

// Async thunks for session actions
export const createSession = createAsyncThunk<
  Session,
  Partial<Session>,
  { rejectValue: string }
>(
  'session/create',
  async (sessionData, { rejectWithValue }) => {
    try {
      const result = await sessionAPI.createSession(sessionData);
      if (result.success && result.data && result.data.id) {
        toast.success('Session created successfully!');
        return result.data;
      } else {
        toast.error(result.error ?? 'Unknown error');
        return rejectWithValue(result.error ?? 'Unknown error');
      }
    } catch (error) {
      toast.error('Failed to create session');
      return rejectWithValue((error as Error).message);
    }
  }
);

export const joinSession = createAsyncThunk<
  Session,
  { sessionId: string; userData: any },
  { rejectValue: string }
>(
  'session/join',
  async ({ sessionId, userData }, { rejectWithValue }) => {
    try {
      const result = await sessionAPI.joinSession(sessionId, userData);
      if (result.success && result.data && result.data.id) {
        toast.success('Joined session successfully!');
        return result.data;
      } else {
        toast.error(result.error ?? 'Unknown error');
        return rejectWithValue(result.error ?? 'Unknown error');
      }
    } catch (error) {
      toast.error('Failed to join session');
      return rejectWithValue((error as Error).message);
    }
  }
);

export const getUserSessions = createAsyncThunk(
  'session/getUserSessions',
  async (_, { rejectWithValue }) => {
    try {
      const result = await sessionAPI.getUserSessions();
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const getActiveSessions = createAsyncThunk(
  'session/getActiveSessions',
  async (_, { rejectWithValue }) => {
    try {
      const result = await sessionAPI.getActiveSessions();
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const getRecentSessions = createAsyncThunk(
  'session/getRecentSessions',
  async (_, { rejectWithValue }) => {
    try {
      const result = await sessionAPI.getRecentSessions();
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const endSession = createAsyncThunk<
  string | number,
  string | number,
  { rejectValue: string }
>(
  'session/end',
  async (sessionId, { rejectWithValue }) => {
    try {
      const result = await sessionAPI.endSession(sessionId);
      if (result.success) {
        toast.success('Session ended successfully');
        return sessionId;
      } else {
        toast.error(result.error);
        return rejectWithValue(result.error);
      }
    } catch (error) {
      toast.error('Failed to end session');
      return rejectWithValue((error as Error).message);
    }
  }
);

export const getAllSessions = createAsyncThunk(
  'session/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const result = await sessionAPI.getAllSessions();
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const initialState: SessionState = {
  currentSession: null,
  userSessions: [],
  activeSessions: [],
  recentSessions: [],
  allSessions: [],
  isInSession: false,
  isCreating: false,
  isJoining: false,
  isLoading: false,
  error: null,
  participants: [],
  sessionForm: {
    title: '',
    description: '',
    isPrivate: false,
    maxParticipants: 4
  },
  joinForm: {
    sessionId: '',
    displayName: ''
  },
  localStream: null,
  remoteStreams: {},
  isVideoEnabled: true,
  isAudioEnabled: true,
  isScreenSharing: false,
  isRecording: false,
  recordingDuration: 0
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateSessionForm: (state, action) => {
      state.sessionForm = { ...state.sessionForm, ...action.payload };
    },
    updateJoinForm: (state, action) => {
      state.joinForm = { ...state.joinForm, ...action.payload };
    },
    clearForms: (state) => {
      state.sessionForm = {
        title: '',
        description: '',
        isPrivate: false,
        maxParticipants: 4
      };
      state.joinForm = {
        sessionId: '',
        displayName: ''
      };
    },
    setCurrentSession: (state, action) => {
      state.currentSession = action.payload;
      state.isInSession = !!action.payload;
    },
    addParticipant: (state, action: { payload: Participant }) => {
      state.participants.push(action.payload);
    },
    removeParticipant: (state, action: { payload: string }) => {
      state.participants = state.participants.filter(p => p.id !== action.payload);
    },
    updateParticipant: (state, action: { payload: Participant }) => {
      const index = state.participants.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.participants[index] = { ...state.participants[index], ...action.payload };
      }
    },
    // WebRTC actions
    setLocalStream: (state, action) => {
      state.localStream = action.payload;
    },
    addRemoteStream: (state, action) => {
      const { participantId, stream } = action.payload;
      state.remoteStreams[participantId] = stream;
    },
    removeRemoteStream: (state, action) => {
      delete state.remoteStreams[action.payload];
    },
    toggleVideo: (state) => {
      state.isVideoEnabled = !state.isVideoEnabled;
    },
    toggleAudio: (state) => {
      state.isAudioEnabled = !state.isAudioEnabled;
    },
    toggleScreenShare: (state) => {
      state.isScreenSharing = !state.isScreenSharing;
    },
    startRecording: (state) => {
      state.isRecording = true;
      state.recordingDuration = 0;
    },
    stopRecording: (state) => {
      state.isRecording = false;
      state.recordingDuration = 0;
    },
    updateRecordingDuration: (state, action) => {
      state.recordingDuration = action.payload;
    },
    leaveSession: (state) => {
      state.currentSession = null;
      state.isInSession = false;
      state.participants = [];
      state.localStream = null;
      state.remoteStreams = {};
      state.isVideoEnabled = true;
      state.isAudioEnabled = true;
      state.isScreenSharing = false;
      state.isRecording = false;
      state.recordingDuration = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create session cases
      .addCase(createSession.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.isCreating = false;
        state.currentSession = action.payload;
        state.isInSession = true;
        state.userSessions.unshift(action.payload);
      })
      .addCase(createSession.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload || 'Failed to create session';
      })
      // Join session cases
      .addCase(joinSession.pending, (state) => {
        state.isJoining = true;
        state.error = null;
      })
      .addCase(joinSession.fulfilled, (state, action) => {
        state.isJoining = false;
        state.currentSession = action.payload;
        state.isInSession = true;
      })
      .addCase(joinSession.rejected, (state, action) => {
        state.isJoining = false;
        state.error = action.payload || 'Failed to join session';
      })
      // Get user sessions cases
      .addCase(getUserSessions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserSessions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userSessions = action.payload;
      })
      .addCase(getUserSessions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Failed to get user sessions';
      })
      // Get active sessions cases
      .addCase(getActiveSessions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getActiveSessions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeSessions = action.payload;
      })
      .addCase(getActiveSessions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Failed to get active sessions';
      })
      // Get recent sessions cases
      .addCase(getRecentSessions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRecentSessions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recentSessions = action.payload;
      })
      .addCase(getRecentSessions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Failed to get recent sessions';
      })
      // End session cases
      .addCase(endSession.fulfilled, (state, action) => {
        const sessionId = action.payload;
        // Remove from active sessions, add to recent
        state.activeSessions = state.activeSessions.filter(s => s.id !== sessionId);
        state.userSessions = state.userSessions.map(s => 
          s.id === sessionId ? { ...s, status: 'ended' } : s
        );
        if (state.currentSession?.id === sessionId) {
          state.currentSession = null;
          state.isInSession = false;
        }
      })
      // Get all sessions cases
      .addCase(getAllSessions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllSessions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allSessions = action.payload;
      })
      .addCase(getAllSessions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Failed to get all sessions';
      });
  }
});

export const {
  clearError,
  updateSessionForm,
  updateJoinForm,
  clearForms,
  setCurrentSession,
  addParticipant,
  removeParticipant,
  updateParticipant,
  setLocalStream,
  addRemoteStream,
  removeRemoteStream,
  toggleVideo,
  toggleAudio,
  toggleScreenShare,
  startRecording,
  stopRecording,
  updateRecordingDuration,
  leaveSession
} = sessionSlice.actions;

export default sessionSlice.reducer;