import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Video, Mail, Lock, Eye, EyeOff, Loader2, User, ArrowRight, Check } from 'lucide-react';
import { registerUser, updateRegisterForm, clearForms, clearError } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store/index';

const Register = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { registerForm, isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  useEffect(() => {
    dispatch(clearForms());
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (field: string, value: string) => {
    dispatch(updateRegisterForm({ [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!registerForm.username || !registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      return;
    }

    if (registerForm.password.length < 6) {
      return;
    }

    const result = await dispatch(registerUser({
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password,
      confirmPassword: registerForm.confirmPassword
    }));

    if (result.type === 'auth/register/fulfilled') {
      navigate('/login');
    }
  };

  const isFormValid = 
    registerForm.username && 
    registerForm.email && 
    registerForm.password && 
    registerForm.confirmPassword &&
    registerForm.password === registerForm.confirmPassword &&
    registerForm.password.length >= 6;

  const passwordsMatch = 
    !registerForm.confirmPassword || 
    registerForm.password === registerForm.confirmPassword;

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
          <h1 className="text-3xl font-light text-white tracking-tight mb-2">Join Riverside</h1>
          <p className="text-sm text-zinc-500">Create your professional account</p>
        </div>

        {/* Glass Card */}
        <div className="relative">
          {/* Card Glow Effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-30"></div>
          
          {/* Main Card */}
          <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
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
                    value={registerForm.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="relative block w-full px-4 py-3.5 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-all"
                    placeholder="Choose a username"
                  />
                  <User className="absolute right-4 top-3.5 h-5 w-5 text-zinc-600" strokeWidth={1.5} />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur"></div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={registerForm.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="relative block w-full px-4 py-3.5 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-all"
                    placeholder="Enter your email"
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
                    autoComplete="new-password"
                    required
                    value={registerForm.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="relative block w-full px-4 py-3.5 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-all"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 h-5 w-5 text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    {showPassword ? <EyeOff strokeWidth={1.5} /> : <Eye strokeWidth={1.5} />}
                  </button>
                </div>
                {registerForm.password && registerForm.password.length < 6 && (
                  <p className="text-xs text-red-400 mt-1.5">
                    Password must be at least 6 characters
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur"></div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={registerForm.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`relative block w-full px-4 py-3.5 bg-zinc-800/50 rounded-xl text-white placeholder-zinc-600 focus:outline-none transition-all ${
                      passwordsMatch 
                        ? 'border border-zinc-700/50 focus:border-zinc-600' 
                        : 'border border-red-500/50 focus:border-red-500/70'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-3.5 h-5 w-5 text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff strokeWidth={1.5} /> : <Eye strokeWidth={1.5} />}
                  </button>
                </div>
                {!passwordsMatch && (
                  <p className="text-xs text-red-400 mt-1.5">
                    Passwords do not match
                  </p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="pt-1">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input
                      id="agree-terms"
                      name="agree-terms"
                      type="checkbox"
                      required
                      className="w-4 h-4 bg-zinc-800/50 border border-zinc-700/50 rounded checked:bg-blue-500 checked:border-blue-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                  </div>
                  <span className="text-sm text-zinc-400 leading-relaxed">
                    I agree to the{' '}
                    <a href="#" className="text-zinc-300 hover:text-white transition-colors underline underline-offset-2">
                      Terms and Conditions
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-zinc-300 hover:text-white transition-colors underline underline-offset-2">
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="group relative w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-white text-black rounded-xl font-medium hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-40 disabled:cursor-not-allowed transition-all overflow-hidden mt-6"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2} />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create account</span>
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
                  <span className="px-4 bg-zinc-900/40 text-zinc-600">Already have an account?</span>
                </div>
              </div>

              {/* Sign In Link */}
              <Link
                to="/login"
                className="block w-full text-center py-3.5 px-4 bg-zinc-800/30 border border-zinc-700/50 text-white rounded-xl font-medium hover:bg-zinc-800/50 hover:border-zinc-600/50 transition-all"
              >
                Sign in instead
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

export default Register;