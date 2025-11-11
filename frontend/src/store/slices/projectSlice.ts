// Project state slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { projectAPI } from '../../utils/api';
import toast from 'react-hot-toast';

// Async thunks for project actions
export const getProjects = createAsyncThunk(
  'project/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const result = await projectAPI.getProjects();
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

export const createProject = createAsyncThunk(
  'project/create',
  async (projectData, { rejectWithValue }) => {
    try {
      const result = await projectAPI.createProject(projectData);
      if (result.success) {
        toast.success('Project created successfully!');
        return result.data;
      } else {
        toast.error(result.error);
        return rejectWithValue(result.error);
      }
    } catch (error) {
      toast.error('Failed to create project');
      return rejectWithValue(error.message);
    }
  }
);

export const updateProject = createAsyncThunk(
  'project/update',
  async ({ id, projectData }, { rejectWithValue }) => {
    try {
      const result = await projectAPI.updateProject(id, projectData);
      if (result.success) {
        toast.success('Project updated successfully!');
        return result.data;
      } else {
        toast.error(result.error);
        return rejectWithValue(result.error);
      }
    } catch (error) {
      toast.error('Failed to update project');
      return rejectWithValue(error.message);
    }
  }
);

export const deleteProject = createAsyncThunk(
  'project/delete',
  async (id, { rejectWithValue }) => {
    try {
      const result = await projectAPI.deleteProject(id);
      if (result.success) {
        toast.success('Project deleted successfully');
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
  projects: [],
  currentProject: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
  projectForm: {
    name: '',
    description: '',
    isPublic: false,
    tags: []
  },
  filter: {
    searchTerm: '',
    sortBy: 'name',
    sortOrder: 'asc',
    tags: []
  },
  selectedProjects: []
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
    updateProjectForm: (state, action) => {
      state.projectForm = { ...state.projectForm, ...action.payload };
    },
    clearProjectForm: (state) => {
      state.projectForm = {
        name: '',
        description: '',
        isPublic: false,
        tags: []
      };
    },
    updateFilter: (state, action) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    clearFilter: (state) => {
      state.filter = {
        searchTerm: '',
        sortBy: 'name',
        sortOrder: 'asc',
        tags: []
      };
    },
    toggleProjectSelection: (state, action) => {
      const projectId = action.payload;
      const index = state.selectedProjects.indexOf(projectId);
      if (index > -1) {
        state.selectedProjects.splice(index, 1);
      } else {
        state.selectedProjects.push(projectId);
      }
    },
    selectAllProjects: (state) => {
      state.selectedProjects = state.projects.map(p => p.id);
    },
    clearSelection: (state) => {
      state.selectedProjects = [];
    },
    addTagToForm: (state, action) => {
      const tag = action.payload.trim();
      if (tag && !state.projectForm.tags.includes(tag)) {
        state.projectForm.tags.push(tag);
      }
    },
    removeTagFromForm: (state, action) => {
      state.projectForm.tags = state.projectForm.tags.filter(tag => tag !== action.payload);
    },
    addTagToFilter: (state, action) => {
      const tag = action.payload.trim();
      if (tag && !state.filter.tags.includes(tag)) {
        state.filter.tags.push(tag);
      }
    },
    removeTagFromFilter: (state, action) => {
      state.filter.tags = state.filter.tags.filter(tag => tag !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Get projects cases
      .addCase(getProjects.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload;
      })
      .addCase(getProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create project cases
      .addCase(createProject.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isCreating = false;
        state.projects.unshift(action.payload);
        state.currentProject = action.payload;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      // Update project cases
      .addCase(updateProject.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedProject = action.payload;
        const index = state.projects.findIndex(p => p.id === updatedProject.id);
        if (index !== -1) {
          state.projects[index] = updatedProject;
        }
        if (state.currentProject?.id === updatedProject.id) {
          state.currentProject = updatedProject;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      // Delete project cases
      .addCase(deleteProject.fulfilled, (state, action) => {
        const projectId = action.payload;
        state.projects = state.projects.filter(p => p.id !== projectId);
        state.selectedProjects = state.selectedProjects.filter(id => id !== projectId);
        if (state.currentProject?.id === projectId) {
          state.currentProject = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  setCurrentProject,
  updateProjectForm,
  clearProjectForm,
  updateFilter,
  clearFilter,
  toggleProjectSelection,
  selectAllProjects,
  clearSelection,
  addTagToForm,
  removeTagFromForm,
  addTagToFilter,
  removeTagFromFilter
} = projectSlice.actions;

export default projectSlice.reducer;