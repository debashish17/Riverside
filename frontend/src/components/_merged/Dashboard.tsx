import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getActiveSessions, endSession } from '../../store/slices/sessionSlice';
import { RootState, AppDispatch } from '../../store/index';
import { Video, Plus, Users, Play, Settings, Zap, Shield, Clock, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth as any);
  const { activeSessions, isLoading, error } = useSelector((state: RootState) => state.session as any);

  useEffect(() => {
    dispatch(getActiveSessions());
  }, [dispatch]);

  const sessions: any[] = activeSessions || [];

  async function handleEndSession(sessionId: string) {
    if (window.confirm('Are you sure you want to end this session?')) {
      try {
  await dispatch(endSession(sessionId as unknown as undefined));
        dispatch(getActiveSessions());
      } catch (err) {
        console.error('Failed to end session:', err);
      }
    }
  }

  // Mock stats for display
  const stats = [
    { label: 'Total Sessions', value: '24', icon: Video, trend: '+12%' },
    { label: 'Active Now', value: sessions.length, icon: Users, trend: 'Live' },
    { label: 'Total Hours', value: '156', icon: Clock, trend: '+8h' },
    { label: 'Quality', value: '4K', icon: TrendingUp, trend: 'HD' },
  ];

  const features = [
    { icon: Zap, title: 'Studio Quality', desc: 'Record in 4K with crystal clear audio' },
    { icon: Shield, title: 'Secure & Private', desc: 'End-to-end encrypted sessions' },
    { icon: Users, title: 'Collaborate', desc: 'Invite unlimited participants' },
  ];

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
        {/* Header Section */}
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 flex items-center justify-center">
                  <Video className="w-5 h-5 text-zinc-400" strokeWidth={1.5} />
                </div>
                <h1 className="text-3xl font-light text-white">
                  Welcome back, <span className="font-medium">{user?.username}</span>
                </h1>
              </div>
              <p className="text-sm text-zinc-500 ml-[52px]">Manage your recording sessions and collaborate with your team</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/sessions/create')}
                className="group relative flex items-center gap-2 px-5 py-3 bg-white text-black rounded-xl font-medium hover:bg-zinc-100 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <Plus className="w-5 h-5" strokeWidth={2} />
                <span>Create Session</span>
              </button>
              <button
                onClick={() => navigate('/sessions/join')}
                className="flex items-center gap-2 px-5 py-3 bg-zinc-800/50 border border-zinc-700/50 text-white rounded-xl font-medium hover:bg-zinc-800 hover:border-zinc-600/50 transition-all"
              >
                <Play className="w-5 h-5" strokeWidth={2} />
                <span>Join Session</span>
              </button>
              <button
                onClick={() => navigate('/sessions')}
                className="flex items-center gap-2 px-5 py-3 bg-zinc-800/30 border border-zinc-700/50 text-zinc-400 rounded-xl font-medium hover:text-white hover:border-zinc-600/50 transition-all"
              >
                <Settings className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800/50 flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-zinc-400" strokeWidth={1.5} />
                    </div>
                    <span className="text-xs px-2 py-1 bg-green-500/10 text-green-400 rounded-md border border-green-500/20">
                      {stat.trend}
                    </span>
                  </div>
                  <div className="text-3xl font-light text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Active Sessions - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur opacity-30"></div>
              <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-light text-white mb-1">Active Sessions</h2>
                    <p className="text-xs text-zinc-500">{sessions.length} session{sessions.length !== 1 ? 's' : ''} running</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-zinc-500">Live</span>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                {isLoading && sessions.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-2 border-zinc-700 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-zinc-500">Loading active sessions...</p>
                  </div>
                )}

                {!isLoading && sessions.length === 0 && !error && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center mx-auto mb-4">
                      <Video className="w-8 h-8 text-zinc-600" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">No active sessions</h3>
                    <p className="text-sm text-zinc-500 mb-6">Create a new session to start recording</p>
                    <button
                      onClick={() => navigate('/sessions/create')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl font-medium hover:bg-zinc-100 transition-all"
                    >
                      <Plus className="w-4 h-4" strokeWidth={2} />
                      <span>Create Session</span>
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  {sessions.map(s => (
                    <div key={s.id} className="group relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/20 group-hover:to-purple-500/20 rounded-xl blur transition-all"></div>
                      <div className="relative bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4 hover:bg-zinc-800/50 transition-all">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 rounded-lg bg-zinc-700/50 flex items-center justify-center">
                                <Video className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                              </div>
                              <div>
                                <h3 className="font-medium text-white">{s.name}</h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-zinc-600">ID: {s.id}</span>
                                  <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 rounded border border-green-500/20">
                                    ACTIVE
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-zinc-500 ml-11">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" strokeWidth={2} />
                                {(s.members || []).length} participant{(s.members || []).length !== 1 ? 's' : ''}
                              </span>
                              <span className="px-2 py-0.5 bg-zinc-700/30 rounded">
                                {s.isOwner ? 'Owner' : 'Member'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 ml-11 md:ml-0">
                            <button
                              onClick={() => navigate(`/sessions/${s.id}`)}
                              className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-zinc-100 transition-all text-sm"
                            >
                              <Play className="w-4 h-4" strokeWidth={2} />
                              <span>Join</span>
                            </button>
                            {s.isOwner && (
                              <button
                                onClick={() => handleEndSession(s.id)}
                                className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg font-medium hover:bg-red-500/20 transition-all text-sm"
                              >
                                End
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Features Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur opacity-30"></div>
              <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6">
                <h3 className="text-sm font-medium text-white mb-4 uppercase tracking-wider">Platform Features</h3>
                <div className="space-y-4">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-800/50 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-5 h-5 text-zinc-400" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-white mb-0.5">{feature.title}</h4>
                        <p className="text-xs text-zinc-500">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Usage Tips */}
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur opacity-30"></div>
              <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6">
                <h3 className="text-sm font-medium text-white mb-4 uppercase tracking-wider">Getting Started</h3>
                <div className="space-y-3 text-xs text-zinc-400">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                      1
                    </div>
                    <p>Click "Create Session" to start a new recording</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-zinc-700 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                      2
                    </div>
                    <p>Share the session ID with participants</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-zinc-700 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                      3
                    </div>
                    <p>Start recording in studio quality</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Banner */}
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur"></div>
          <div className="relative bg-gradient-to-r from-zinc-900/60 to-zinc-800/60 backdrop-blur-xl border border-zinc-700/50 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-light text-white mb-2">Ready to create something amazing?</h3>
                <p className="text-sm text-zinc-400">Professional recording made simple with Riverside</p>
              </div>
              <button
                onClick={() => navigate('/sessions/create')}
                className="group relative flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-medium hover:bg-zinc-100 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity rounded-xl"></div>
                <span>Start Recording</span>
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}