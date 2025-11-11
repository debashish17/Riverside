import create from 'zustand';

export const useAppStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  projects: [],
  setProjects: (projects) => set({ projects }),
  recordings: [],
  setRecordings: (recordings) => set({ recordings }),
  loading: false,
  setLoading: (loading) => set({ loading }),
  error: null,
  setError: (error) => set({ error }),
}));
