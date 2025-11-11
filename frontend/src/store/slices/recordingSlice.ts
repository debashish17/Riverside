// Recording state slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { recordingAPI } from '../../utils/api';
import toast from 'react-hot-toast';

// Types
export interface Recording {
  id: string;
  filename: string;
  originalname?: string;
  projectId?: string;
  sessionId?: string;
  sessionName?: string;
  uploadedAt?: string;
  size?: number;
  isLocal?: boolean;
  uploadStatus?: string;
}

export interface RecordingState {
  recordings: Recording[];
  currentRecording: Recording | null;
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  filter: {
    searchTerm: string;
    sortBy: string;
    sortOrder: string;
    dateRange: any;
  };
  selectedRecordings: string[];
  isProcessing: boolean;
  processingStatus: string | null;
}

// Async thunks for recording actions
export const uploadRecording = createAsyncThunk<
  Recording,
  { file: File; metadata: any },
  { rejectValue: string }
>(
  'recording/upload',
  async ({ file, metadata }, { rejectWithValue }) => {
    try {
      const result = await recordingAPI.uploadRecording(file, metadata);
      if (result.success) {
        toast.success('Recording uploaded successfully!');
        return result.data;
      } else {
        toast.error(result.error ?? 'Unknown error');
        return rejectWithValue(result.error ?? 'Unknown error');
      }
    } catch (error) {
      toast.error('Upload failed');
      return rejectWithValue((error as Error).message);
    }
  }
);

export const getRecordings = createAsyncThunk<
  Recording[],
  void,
  { rejectValue: string }
>(
  'recording/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const result = await recordingAPI.getRecordings();
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

export const getRecording = createAsyncThunk<
  Recording,
  string,
  { rejectValue: string }
>(
  'recording/getOne',
  async (id, { rejectWithValue }) => {
    try {
      const result = await recordingAPI.getRecording(id);
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

export const deleteRecording = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'recording/delete',
  async (id, { rejectWithValue }) => {
    try {
      const result = await recordingAPI.deleteRecording(id);
      if (result.success) {
        toast.success('Recording deleted successfully');
        return id;
      } else {
        toast.error(result.error ?? 'Unknown error');
        return rejectWithValue(result.error ?? 'Unknown error');
      }
    } catch (error) {
      toast.error('Delete failed');
      return rejectWithValue((error as Error).message);
    }
  }
);

const initialState: RecordingState = {
  recordings: [],
  currentRecording: null,
  isLoading: false,
  isUploading: false,
  uploadProgress: 0,
  error: null,
  filter: {
    searchTerm: '',
    sortBy: 'date',
    sortOrder: 'desc',
    dateRange: null
  },
  selectedRecordings: [],
  isProcessing: false,
  processingStatus: null
};

const recordingSlice = createSlice({
  name: 'recording',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentRecording: (state, action: { payload: Recording | null }) => {
      state.currentRecording = action.payload;
    },
    updateFilter: (state, action: { payload: Partial<RecordingState['filter']> }) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    clearFilter: (state) => {
      state.filter = {
        searchTerm: '',
        sortBy: 'date',
        sortOrder: 'desc',
        dateRange: null
      };
    },
    toggleRecordingSelection: (state, action: { payload: string }) => {
      const recordingId = action.payload;
      const index = state.selectedRecordings.indexOf(recordingId);
      if (index > -1) {
        state.selectedRecordings.splice(index, 1);
      } else {
        state.selectedRecordings.push(recordingId);
      }
    },
    selectAllRecordings: (state) => {
      state.selectedRecordings = state.recordings.map(r => r.id);
    },
    clearSelection: (state) => {
      state.selectedRecordings = [];
    },
    setUploadProgress: (state, action: { payload: number }) => {
      state.uploadProgress = action.payload;
    },
    setProcessingStatus: (state, action: { payload: string | null }) => {
      state.processingStatus = action.payload;
    },
    updateRecordingMetadata: (state, action: { payload: { id: string; metadata: Partial<Recording> } }) => {
      const { id, metadata } = action.payload;
      const recording = state.recordings.find(r => r.id === id);
      if (recording) {
        Object.assign(recording, metadata);
      }
    },
    addLocalRecording: (state, action: { payload: Recording }) => {
      // Add a recording that's been created locally but not yet uploaded
      state.recordings.unshift({
        ...action.payload,
        isLocal: true,
        uploadStatus: 'pending'
      });
    },
    updateLocalRecording: (state, action: { payload: { id: string; updates: Partial<Recording> } }) => {
      const { id, updates } = action.payload;
      const recording = state.recordings.find(r => r.id === id);
      if (recording) {
        Object.assign(recording, updates);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Upload recording cases
      .addCase(uploadRecording.pending, (state) => {
        state.isUploading = true;
        state.uploadProgress = 0;
        state.error = null;
      })
      .addCase(uploadRecording.fulfilled, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 0;
        state.recordings.unshift(action.payload);
      })
      .addCase(uploadRecording.rejected, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 0;
        state.error = action.payload || 'Failed to upload recording';
      })
      // Get recordings cases
      .addCase(getRecordings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRecordings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recordings = action.payload;
      })
      .addCase(getRecordings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to get recordings';
      })
      // Get single recording cases
      .addCase(getRecording.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRecording.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRecording = action.payload;
      })
      .addCase(getRecording.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to get recording';
      })
      // Delete recording cases
      .addCase(deleteRecording.pending, (state) => {
        state.isProcessing = true;
      })
      .addCase(deleteRecording.fulfilled, (state, action) => {
        state.isProcessing = false;
        const recordingId = action.payload;
        state.recordings = state.recordings.filter(r => r.id !== recordingId);
        state.selectedRecordings = state.selectedRecordings.filter(id => id !== recordingId);
        if (state.currentRecording?.id === recordingId) {
          state.currentRecording = null;
        }
      })
      .addCase(deleteRecording.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload || 'Failed to delete recording';
      });
  }
});

export const {
  clearError,
  setCurrentRecording,
  updateFilter,
  clearFilter,
  toggleRecordingSelection,
  selectAllRecordings,
  clearSelection,
  setUploadProgress,
  setProcessingStatus,
  updateRecordingMetadata,
  addLocalRecording,
  updateLocalRecording
} = recordingSlice.actions;

export default recordingSlice.reducer;