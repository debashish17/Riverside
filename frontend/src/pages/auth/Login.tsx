import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Video, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { loginUser, updateLoginForm, clearForms, clearError } from '../../store/slices/authSlice';

const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loginForm, isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [showPassword, setShowPassword] = React.useState(false);

  useEffect(() => {
    dispatch(clearForms());
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (field, value) => {
    dispatch(updateLoginForm({ [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!loginForm.username || !loginForm.password) {
      return;
    }

    const result = await dispatch(loginUser({
      username: loginForm.username,
      password: loginForm.password
    } as { username: string; password: string }));

    if (result.type === 'auth/login/fulfilled') {
      navigate('/dashboard');
    }
  };

  const isFormValid = loginForm.username && loginForm.password;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Ambient Light Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 mb-6 relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Video className="w-7 h-7 text-zinc-400 relative z-10" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-light text-white tracking-tight mb-2">Riverside</h1>
          <p className="text-sm text-zinc-500">Professional Video Platform</p>
        </div>

        {/* Glass Card */}
        <div className="relative">
          {/* Card Glow Effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-30"></div>
          
          {/* Main Card */}
          <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-8">
            {/* Demo Credentials */}
            <div className="mb-8 p-4 bg-zinc-800/30 border border-zinc-700/30 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Demo Access</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Username</span>
                  <code className="text-zinc-300 font-mono text-xs bg-zinc-800/50 px-2 py-1 rounded">admin</code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Password</span>
                  <code className="text-zinc-300 font-mono text-xs bg-zinc-800/50 px-2 py-1 rounded">admin123</code>
                </div>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Username Field */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur"></div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={loginForm.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="relative block w-full px-4 py-3.5 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-all"
                    placeholder="Enter username"
                  />
                  <Mail className="absolute right-4 top-3.5 h-5 w-5 text-zinc-600" strokeWidth={1.5} />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur"></div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={loginForm.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="relative block w-full px-4 py-3.5 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-all"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 h-5 w-5 text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    {showPassword ? <EyeOff strokeWidth={1.5} /> : <Eye strokeWidth={1.5} />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="w-4 h-4 bg-zinc-800/50 border border-zinc-700/50 rounded checked:bg-blue-500 checked:border-blue-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">Remember me</span>
                </label>

                <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="group relative w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-white text-black rounded-xl font-medium hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-40 disabled:cursor-not-allowed transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2} />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-zinc-900/40 text-zinc-600">New to Riverside?</span>
                </div>
              </div>

              {/* Sign Up Link */}
              <Link
                to="/register"
                className="block w-full text-center py-3.5 px-4 bg-zinc-800/30 border border-zinc-700/50 text-white rounded-xl font-medium hover:bg-zinc-800/50 hover:border-zinc-600/50 transition-all"
              >
                Create an account
              </Link>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-600">
            Secured by enterprise-level encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;