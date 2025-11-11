// Recording state slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { recordingAPI } from '../../utils/api';
import toast from 'react-hot-toast';

// Async thunks for recording actions
export const uploadRecording = createAsyncThunk(
  'recording/upload',
  async ({ file, metadata }, { rejectWithValue }) => {
    try {
      const result = await recordingAPI.uploadRecording(file, metadata);
      if (result.success) {
        toast.success('Recording uploaded successfully!');
        return result.data;
      } else {
        toast.error(result.error);
        return rejectWithValue(result.error);
      }
    } catch (error) {
      toast.error('Upload failed');
      return rejectWithValue(error.message);
    }
  }
);

export const getRecordings = createAsyncThunk(
  'recording/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const result = await recordingAPI.getRecordings();
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

export const getRecording = createAsyncThunk(
  'recording/getOne',
  async (id, { rejectWithValue }) => {
    try {
      const result = await recordingAPI.getRecording(id);
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

export const deleteRecording = createAsyncThunk(
  'recording/delete',
  async (id, { rejectWithValue }) => {
    try {
      const result = await recordingAPI.deleteRecording(id);
      if (result.success) {
        toast.success('Recording deleted successfully');
        return id;
      } else {
        toast.error(result.error);
        return rejectWithValue(result.error);
      }
    } catch (error) {
      toast.error('Delete failed');
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
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
    setCurrentRecording: (state, action) => {
      state.currentRecording = action.payload;
    },
    updateFilter: (state, action) => {
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
    toggleRecordingSelection: (state, action) => {
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
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    setProcessingStatus: (state, action) => {
      state.processingStatus = action.payload;
    },
    updateRecordingMetadata: (state, action) => {
      const { id, metadata } = action.payload;
      const recording = state.recordings.find(r => r.id === id);
      if (recording) {
        Object.assign(recording, metadata);
      }
    },
    addLocalRecording: (state, action) => {
      // Add a recording that's been created locally but not yet uploaded
      state.recordings.unshift({
        ...action.payload,
        isLocal: true,
        uploadStatus: 'pending'
      });
    },
    updateLocalRecording: (state, action) => {
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
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