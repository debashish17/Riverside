import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Play, Clock, Users, Plus, Video, Calendar, User, ArrowRight, Trash2 } from 'lucide-react';
import { getActiveSessions, getRecentSessions, endSession } from '../../store/slices/sessionSlice';

export default function Sessions() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { activeSessions, recentSessions, isLoading, error } = useSelector((state) => state.session);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    dispatch(getActiveSessions());
    dispatch(getRecentSessions());
  }, [dispatch]);

  const handleEndSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to end this session?')) {
      try {
        await dispatch(endSession(sessionId));
        dispatch(getActiveSessions());
        dispatch(getRecentSessions());
      } catch (err) {
        console.error('Failed to end session:', err);
      }
    }
  };

  const activeSessionsList = activeSessions || [];
  const recentSessionsList = recentSessions || [];

  return (
    <div className="min-h-screen bg-black">
      {/* Animated Grid Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Ambient Lights */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 flex items-center justify-center">
              <Video className="w-5 h-5 text-zinc-400" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-light text-white">Session Management</h1>
          </div>
          <p className="text-sm text-zinc-500 ml-[52px]">
            Manage your active sessions and view recent session history
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid gap-6 md:grid-cols-2 mb-12">
          {/* Create Session Card */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 hover:border-zinc-700/50 transition-all">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-green-400" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white mb-1">Create Session</h3>
                  <p className="text-sm text-zinc-500">Start a new video session with custom settings</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/sessions/create')}
                className="group/btn relative w-full flex items-center justify-center gap-2 py-3 px-4 bg-white text-black rounded-xl font-medium hover:bg-zinc-100 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover/btn:opacity-10 transition-opacity"></div>
                <span>Create New Session</span>
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Join Session Card */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 hover:border-zinc-700/50 transition-all">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white mb-1">Join Session</h3>
                  <p className="text-sm text-zinc-500">Enter session ID to join an existing session</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/sessions/join')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-800/50 border border-zinc-700/50 text-white rounded-xl font-medium hover:bg-zinc-800 hover:border-zinc-600/50 transition-all"
              >
                <span>Join Existing Session</span>
                <ArrowRight className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 relative">
            <div className="absolute -inset-0.5 bg-red-500/20 rounded-2xl blur"></div>
            <div className="relative p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Tabs Section */}
        <div className="relative mb-8">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur opacity-30"></div>
          <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-2">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('active')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm transition-all ${
                  activeTab === 'active'
                    ? 'bg-white text-black'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <Play className="w-4 h-4" strokeWidth={2} />
                <span>Active Sessions</span>
                <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                  activeTab === 'active'
                    ? 'bg-black/10 text-black'
                    : 'bg-zinc-700/50 text-zinc-400'
                }`}>
                  {activeSessionsList.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm transition-all ${
                  activeTab === 'recent'
                    ? 'bg-white text-black'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <Clock className="w-4 h-4" strokeWidth={2} />
                <span>Recent Sessions</span>
                <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                  activeTab === 'recent'
                    ? 'bg-black/10 text-black'
                    : 'bg-zinc-700/50 text-zinc-400'
                }`}>
                  {recentSessionsList.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Session Lists */}
        <div className="space-y-4">
          {/* Active Sessions Tab */}
          {activeTab === 'active' && (
            <div>
              {isLoading && activeSessionsList.length === 0 ? (
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur opacity-30"></div>
                  <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-12 text-center">
                    <div className="w-12 h-12 border-2 border-zinc-700 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-zinc-500">Loading active sessions...</p>
                  </div>
                </div>
              ) : activeSessionsList.length === 0 ? (
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur opacity-30"></div>
                  <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center mx-auto mb-4">
                      <Video className="w-8 h-8 text-zinc-600" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">No active sessions</h3>
                    <p className="text-sm text-zinc-500 mb-6">Create a new session to get started</p>
                    <button
                      onClick={() => navigate('/sessions/create')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl font-medium hover:bg-zinc-100 transition-all"
                    >
                      <Plus className="w-4 h-4" strokeWidth={2} />
                      <span>Create Session</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeSessionsList.map((session) => (
                    <div key={session.id} className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/0 to-emerald-500/0 group-hover:from-green-500/20 group-hover:to-emerald-500/20 rounded-2xl blur transition-all"></div>
                      <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 hover:border-zinc-700/50 transition-all">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-lg bg-zinc-800/50 flex items-center justify-center">
                                <Video className="w-5 h-5 text-zinc-400" strokeWidth={1.5} />
                              </div>
                              <div>
                                <h3 className="text-lg font-medium text-white">{session.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded border border-green-500/20 text-xs font-medium">
                                    ACTIVE
                                  </span>
                                  {session.isOwner && (
                                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20 text-xs font-medium">
                                      OWNER
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="ml-[52px] space-y-2">
                              <div className="flex items-center gap-4 text-xs text-zinc-500">
                                <span className="flex items-center gap-1.5">
                                  <span className="text-zinc-600">ID:</span>
                                  <code className="text-zinc-400 font-mono bg-zinc-800/50 px-1.5 py-0.5 rounded">{session.id}</code>
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Users className="w-3 h-3" strokeWidth={2} />
                                  {session.members?.length || 0} participant{(session.members?.length || 0) !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                <Calendar className="w-3 h-3" strokeWidth={2} />
                                <span>Created {new Date(session.createdAt).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-3 ml-[52px] lg:ml-0">
                            <button
                              onClick={() => navigate(`/sessions/${session.id}`)}
                              className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl font-medium hover:bg-zinc-100 transition-all"
                            >
                              <Play className="w-4 h-4" strokeWidth={2} />
                              <span>Join</span>
                            </button>
                            {session.isOwner && (
                              <button
                                onClick={() => handleEndSession(session.id)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-medium hover:bg-red-500/20 transition-all"
                              >
                                <Trash2 className="w-4 h-4" strokeWidth={2} />
                                <span>End</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recent Sessions Tab */}
          {activeTab === 'recent' && (
            <div>
              {isLoading && recentSessionsList.length === 0 ? (
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur opacity-30"></div>
                  <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-12 text-center">
                    <div className="w-12 h-12 border-2 border-zinc-700 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-zinc-500">Loading recent sessions...</p>
                  </div>
                </div>
              ) : recentSessionsList.length === 0 ? (
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur opacity-30"></div>
                  <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-zinc-600" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">No recent sessions</h3>
                    <p className="text-sm text-zinc-500">Your completed sessions will appear here</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentSessionsList.map((session) => (
                    <div key={session.id} className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-700/0 to-zinc-600/0 group-hover:from-zinc-700/20 group-hover:to-zinc-600/20 rounded-2xl blur transition-all"></div>
                      <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 hover:border-zinc-700/50 transition-all opacity-75">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-lg bg-zinc-800/50 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-zinc-600" strokeWidth={1.5} />
                              </div>
                              <div>
                                <h3 className="text-lg font-medium text-white">{session.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`px-2 py-0.5 rounded border text-xs font-medium ${
                                    session.status === 'ended' 
                                      ? 'bg-zinc-700/30 text-zinc-400 border-zinc-700/50'
                                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                                  }`}>
                                    {session.status === 'ended' ? 'ENDED' : 'TERMINATED'}
                                  </span>
                                  {session.isOwner && (
                                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20 text-xs font-medium">
                                      OWNER
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="ml-[52px] space-y-2">
                              <div className="flex items-center gap-4 text-xs text-zinc-500">
                                <span className="flex items-center gap-1.5">
                                  <span className="text-zinc-600">ID:</span>
                                  <code className="text-zinc-400 font-mono bg-zinc-800/50 px-1.5 py-0.5 rounded">{session.id}</code>
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Users className="w-3 h-3" strokeWidth={2} />
                                  {session.members?.length || 0} participant{(session.members?.length || 0) !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <div className="space-y-1 text-xs text-zinc-500">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3 h-3" strokeWidth={2} />
                                  <span>Created {new Date(session.createdAt).toLocaleString()}</span>
                                </div>
                                {session.endedAt && (
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" strokeWidth={2} />
                                    <span>Ended {new Date(session.endedAt).toLocaleString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="ml-[52px] lg:ml-0">
                            <div className="px-5 py-2.5 bg-zinc-800/30 border border-zinc-700/50 text-zinc-500 rounded-xl text-sm font-medium">
                              Session Completed
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}