// Sessions page component
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Video, 
  Users, 
  Plus, 
  Calendar,
  Clock,
  PlayCircle
} from 'lucide-react';
import { getUserSessions } from '../store/slices/sessionSlice';

const Sessions = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userSessions, isLoading } = useSelector((state) => state.session);

  useEffect(() => {
    dispatch(getUserSessions());
  }, [dispatch]);

  const activeSessions = userSessions.filter(session => !session.ended);
  const pastSessions = userSessions.filter(session => session.ended);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sessions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your video sessions
          </p>
        </div>
        <button
          onClick={() => navigate('/sessions/create')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Session
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => navigate('/sessions/create')}
          className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 transition-colors group"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
              <Video className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Create Session
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Start a new video session
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/sessions/join')}
          className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-300 dark:hover:border-green-600 transition-colors group"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Join Session
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Join an existing session
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Active Sessions
            </h2>
            <div className="space-y-3">
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <PlayCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {session.name || `Session ${session.id}`}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {session.participants?.length || 0} participants
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                      Live
                    </span>
                    <button
                      onClick={() => navigate(`/sessions/${session.id}`)}
                      className="px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                    >
                      Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Past Sessions */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Recent Sessions
          </h2>
          
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : pastSessions.length > 0 ? (
            <div className="space-y-3">
              {pastSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      <Video className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {session.name || `Session ${session.id}`}
                      </h3>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>{session.createdAt || 'Unknown date'}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{session.duration || 'Unknown duration'}</span>
                        </div>
                        <span>{session.participants?.length || 0} participants</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full">
                      Ended
                    </span>
                    <button
                      onClick={() => navigate('/recordings')}
                      className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      View Recording
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No sessions yet
              </p>
              <button
                onClick={() => navigate('/sessions/create')}
                className="mt-2 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Create your first session
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sessions;