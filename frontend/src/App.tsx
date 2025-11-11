import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { setAuthFromStorage, verifyToken } from './store/slices/authSlice';

// Components
import BaseLayout from './components/_merged/BaseLayout';
import LoadingScreen from './components/_merged/LoadingScreen';
import ErrorBoundary from './components/_merged/ErrorBoundary';

// Pages - use existing components instead of redundant pages
import Dashboard from './components/_merged/Dashboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import CreateSession from './pages/session/CreateSession';
import JoinSession from './pages/session/JoinSession';
import SessionRoom from './pages/session/SessionRoom';
import Sessions from './pages/Sessions';
import RecordingsPage from './components/_merged/RecordingsPage';
import Projects from './pages/Projects';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useSelector((state: any) => state.auth);
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Main App Component
const AppContent = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector((state: any) => state.auth);
  const { theme, sidebarOpen } = useSelector((state: any) => state.ui);

  useEffect(() => {
    // Set theme on body
    document.body.className = theme;
  }, [theme]);

  useEffect(() => {
    // Initialize auth from storage only once on mount
    dispatch(setAuthFromStorage());
    
    // Verify token if exists
    const token = localStorage.getItem('auth_token');
    if (token) {
      dispatch(verifyToken() as any);
    }
  }, [dispatch]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className={`app ${theme} transition-colors duration-200`}>
      <ErrorBoundary>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} 
            />
            <Route 
              path="/register" 
              element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />} 
            />
            {/* Protected Routes with BaseLayout */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <BaseLayout>
                  <Dashboard />
                </BaseLayout>
              </ProtectedRoute>
            } />
            <Route path="/sessions" element={
              <ProtectedRoute>
                <BaseLayout>
                  <Sessions />
                </BaseLayout>
              </ProtectedRoute>
            } />
            <Route path="/sessions/create" element={
              <ProtectedRoute>
                <BaseLayout>
                  <CreateSession />
                </BaseLayout>
              </ProtectedRoute>
            } />
            <Route path="/sessions/join" element={
              <ProtectedRoute>
                <BaseLayout>
                  <JoinSession />
                </BaseLayout>
              </ProtectedRoute>
            } />
            <Route path="/sessions/:sessionId" element={
              <ProtectedRoute>
                <SessionRoom />
              </ProtectedRoute>
            } />
            <Route path="/meeting" element={
              <ProtectedRoute>
                <BaseLayout>
                  <div>Meeting component coming soon</div>
                </BaseLayout>
              </ProtectedRoute>
            } />
            <Route path="/recordings" element={
              <ProtectedRoute>
                <BaseLayout>
                  <RecordingsPage />
                </BaseLayout>
              </ProtectedRoute>
            } />
            <Route path="/projects" element={
              <ProtectedRoute>
                <BaseLayout>
                  <Projects />
                </BaseLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <BaseLayout>
                  <Profile />
                </BaseLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <BaseLayout>
                  <Settings />
                </BaseLayout>
              </ProtectedRoute>
            } />
            {/* Default redirects */}
            <Route 
              path="/" 
              element={
                <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
              } 
            />
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          {/* Global Toast Notifications */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'toast',
              style: {
                background: theme === 'dark' ? '#374151' : '#ffffff',
                color: theme === 'dark' ? '#ffffff' : '#374151',
                border: theme === 'dark' ? '1px solid #4B5563' : '1px solid #E5E7EB',
              },
            }}
          />
        </Router>
      </ErrorBoundary>
    </div>
  );
};

// Root App Component with Provider
const App = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
