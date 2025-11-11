// Create Session page component
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Video, Settings, Users, ArrowLeft, ArrowRight, Sparkles, Info } from 'lucide-react';
import { createSession } from '../../store/slices/sessionSlice';
import type { AppDispatch } from '../../store';

const CreateSession = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [sessionName, setSessionName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const sessionData = {
        name: sessionName || `Session-${Date.now()}`,
        description,
        isPrivate,
        maxParticipants,
      };

      const result = await dispatch(createSession(sessionData));

      if (result.payload && (result.payload as any).id) {
        console.log('✅ Session created successfully, navigating to session room...');
        // Small delay to ensure database transaction is committed
        setTimeout(() => {
          navigate(`/sessions/${(result.payload as any).id}`);
        }, 100);
      } else {
        console.error('❌ Failed to create session - no payload or ID');
      }
    } catch (error) {
      console.error('Failed to create session:', error);
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
              <Video className="w-8 h-8 text-blue-400 relative z-10" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-light text-white mb-3">
              Create New Session
            </h1>
            <p className="text-sm text-zinc-500">
              Set up your video session and invite participants
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Session Name */}
            <div>
              <label htmlFor="sessionName" className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">
                Session Name
              </label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-focus-within:from-blue-500/20 group-focus-within:to-purple-500/20 rounded-xl blur transition-all duration-300"></div>
                <div className="relative">
                  <input
                    type="text"
                    id="sessionName"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    placeholder="Enter session name (optional)"
                    className="w-full pl-11 pr-4 py-4 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-all text-sm"
                  />
                  <Sparkles className="absolute left-4 top-4 h-5 w-5 text-zinc-600" strokeWidth={1.5} />
                </div>
              </div>
              <p className="text-xs text-zinc-600 mt-2 ml-1">
                If left empty, a name will be generated automatically
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">
                Description
              </label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-focus-within:from-blue-500/20 group-focus-within:to-purple-500/20 rounded-xl blur transition-all duration-300"></div>
                <div className="relative">
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's this session about? (optional)"
                    rows={3}
                    className="w-full px-4 py-4 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-all text-sm resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Session Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Max Participants */}
              <div>
                <label htmlFor="maxParticipants" className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">
                  <Users className="w-3.5 h-3.5 inline mr-1.5 mb-0.5" strokeWidth={1.5} />
                  Max Participants
                </label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-focus-within:from-blue-500/20 group-focus-within:to-purple-500/20 rounded-xl blur transition-all duration-300"></div>
                  <select
                    id="maxParticipants"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
                    className="relative w-full px-4 py-4 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white focus:outline-none focus:border-zinc-600 transition-all text-sm appearance-none cursor-pointer"
                  >
                    <option value={2}>2 participants</option>
                    <option value={5}>5 participants</option>
                    <option value={10}>10 participants</option>
                    <option value={20}>20 participants</option>
                    <option value={50}>50 participants</option>
                  </select>
                </div>
              </div>

              {/* Privacy Setting */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">
                  <Settings className="w-3.5 h-3.5 inline mr-1.5 mb-0.5" strokeWidth={1.5} />
                  Privacy
                </label>
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-700/20 to-zinc-600/20 rounded-xl blur"></div>
                  <div className="relative bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4">
                    <div className="flex items-center gap-6">
                      <label className="flex items-center cursor-pointer group/radio">
                        <input
                          type="radio"
                          name="privacy"
                          checked={!isPrivate}
                          onChange={() => setIsPrivate(false)}
                          className="w-4 h-4 text-blue-500 bg-zinc-700 border-zinc-600 focus:ring-blue-500 focus:ring-offset-zinc-900 cursor-pointer"
                        />
                        <span className="ml-2.5 text-sm text-zinc-300 group-hover/radio:text-white transition-colors">Public</span>
                      </label>
                      <label className="flex items-center cursor-pointer group/radio">
                        <input
                          type="radio"
                          name="privacy"
                          checked={isPrivate}
                          onChange={() => setIsPrivate(true)}
                          className="w-4 h-4 text-blue-500 bg-zinc-700 border-zinc-600 focus:ring-blue-500 focus:ring-offset-zinc-900 cursor-pointer"
                        />
                        <span className="ml-2.5 text-sm text-zinc-300 group-hover/radio:text-white transition-colors">Private</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Features Info */}
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur"></div>
              <div className="relative bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/20 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Info className="w-4 h-4 text-blue-400" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white mb-2">
                      Session Features
                    </h3>
                    <ul className="text-xs text-zinc-400 space-y-1.5">
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                        HD video and audio recording
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                        Screen sharing capabilities
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                        Real-time chat
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                        Automatic cloud storage
                      </li>
                    </ul>
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
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-medium hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Video className="w-5 h-5" strokeWidth={2} />
                    <span>Create & Join</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Additional Info Cards */}
      
    </div>
  );
};

export default CreateSession;