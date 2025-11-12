// Join Session page component
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Users, Search, ArrowRight, ArrowLeft, Plus, Info } from 'lucide-react';
import { joinSession } from '../../store/slices/sessionSlice';
import type { AppDispatch } from '../../store';

const JoinSession = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sessionId.trim()) {
      setError('Please enter a session ID');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Use Redux action to join session
      const result = await dispatch(joinSession({
        sessionId: sessionId.trim(),
        userData: {}
      }));

      // Check if the action was fulfilled
      if (joinSession.fulfilled.match(result)) {
        // Navigate to the session room on success
        navigate(`/sessions/${sessionId.trim()}`);
      } else if (joinSession.rejected.match(result)) {
        // Handle rejected action - extract error message
        const errorMessage = result.payload as string || 'Failed to join session';
        setError(errorMessage);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to join session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Navigation */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={1.5} />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-30"></div>
        <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-8">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-6 relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Users className="w-8 h-8 text-blue-400 relative z-10" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-light text-white mb-3">
              Join Session
            </h1>
            <p className="text-sm text-zinc-500">
              Enter the session ID to join an existing session
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Session ID Input */}
            <div>
              <label htmlFor="sessionId" className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">
                Session ID
              </label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-focus-within:from-blue-500/20 group-focus-within:to-purple-500/20 rounded-xl blur transition-all duration-300"></div>
                <div className="relative">
                  <input
                    type="text"
                    id="sessionId"
                    value={sessionId}
                    onChange={(e) => {
                      setSessionId(e.target.value);
                      setError(''); // Clear error when user types
                    }}
                    placeholder="Enter session ID (e.g., abc123xyz)"
                    className="w-full pl-11 pr-4 py-4 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-all font-mono text-sm"
                    required
                  />
                  <Search className="absolute left-4 top-4 h-5 w-5 text-zinc-600" strokeWidth={1.5} />
                </div>
              </div>
              
              {error && (
                <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-700/20 to-zinc-600/20 rounded-xl blur"></div>
              <div className="relative bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-700/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Info className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white mb-1.5">
                      How to get a session ID?
                    </h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      The session creator can share the session ID with you. It's usually displayed 
                      in the session room or sent via invite link.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/sessions')}
                className="flex items-center gap-2 px-6 py-3 bg-zinc-800/50 border border-zinc-700/50 text-white rounded-xl font-medium hover:bg-zinc-800 hover:border-zinc-600/50 transition-all"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={isLoading || !sessionId.trim()}
                className="group relative flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-medium hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                    <span>Joining...</span>
                  </>
                ) : (
                  <>
                    <span>Join Session</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-zinc-900/40 text-zinc-600">Don't have a session ID?</span>
            </div>
          </div>

          {/* Alternative Action */}
          <button
            onClick={() => navigate('/sessions/create')}
            className="group w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl font-medium hover:bg-blue-500/20 transition-all"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" strokeWidth={2} />
            <span>Create New Session Instead</span>
          </button>
        </div>
      </div>

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-700/0 to-zinc-600/0 group-hover:from-zinc-700/20 group-hover:to-zinc-600/20 rounded-xl blur transition-all"></div>
          <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-light text-white mb-1">1</div>
            <div className="text-xs text-zinc-500">Get Session ID</div>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-700/0 to-zinc-600/0 group-hover:from-zinc-700/20 group-hover:to-zinc-600/20 rounded-xl blur transition-all"></div>
          <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-light text-white mb-1">2</div>
            <div className="text-xs text-zinc-500">Enter ID Above</div>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-700/0 to-zinc-600/0 group-hover:from-zinc-700/20 group-hover:to-zinc-600/20 rounded-xl blur transition-all"></div>
          <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-light text-white mb-1">3</div>
            <div className="text-xs text-zinc-500">Join & Collaborate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinSession;