// Session Room page component
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { sessionAPI } from '../../utils/api';
import { socket } from '../../utils/socket';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Users, 
  MessageSquare, 
  Phone,
  Share,
  Settings,
  Copy,
  ArrowLeft
} from 'lucide-react';

const SessionRoom = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const mediaRecorderRef = React.useRef(null);
  const recordedChunksRef = React.useRef([]);
  const streamRef = React.useRef(null);
  const videoRef = React.useRef(null);
  const { user } = useSelector((state) => state.auth);
  
  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const fetchSessionData = useCallback(async (retryCount = 0) => {
    try {
      setIsLoading(true);
      setError('');
      
      const result = await sessionAPI.getSession(sessionId);
      
      if (result.success) {
        // The backend returns the session data directly in the result object
        setSession(result);
        setParticipants(result.participants || []);
        console.log('✅ Session loaded:', result.name || `Session ${sessionId}`);
      } else {
        // Retry up to 3 times with increasing delays for newly created sessions
        if (retryCount < 3 && result.error?.includes('Session not found')) {
          console.log(`⏳ Session not found, retrying in ${(retryCount + 1) * 500}ms... (attempt ${retryCount + 1}/3)`);
          setTimeout(() => {
            fetchSessionData(retryCount + 1);
          }, (retryCount + 1) * 500);
          return;
        }
        
        setError(result.error || 'Session not found');
        console.error('❌ Failed to load session:', result.error);
      }
    } catch (err) {
      setError(err.message);
      console.error('❌ Error fetching session:', err);
    } finally {
      if (retryCount === 0) {
        setIsLoading(false);
      }
    }
  }, [sessionId]);

  // Recording useEffect (separate from session fetch)
  useEffect(() => {
    // Start video/audio and recording in background
    const startMediaAndRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        // Start recording if enabled
        recordedChunksRef.current = [];
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };
        if (isRecording) mediaRecorder.start();
      } catch (err) {
        setError('Could not access camera/microphone');
      }
    };
    startMediaAndRecording();

    // Socket.io setup
    if (!socket.connected) socket.connect();
    socket.emit('join-room', { roomId: sessionId, userId: user?.id || user?.username });
    socket.on('participants-update', setParticipants);
    socket.on('message', (msg) => setMessages((prev) => [...prev, msg]));

    return () => {
      // Stop and upload recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.onstop = async () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          try {
            const formData = new FormData();
            formData.append('recording', blob, `session-${sessionId}-${Date.now()}.webm`);
            formData.append('sessionId', sessionId);
            await fetch('/api/recordings/upload', {
              method: 'POST',
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
              body: formData
            });
          } catch (error) {
            // Optionally show a toast
          }
        };
      }
      
      // Stop all media tracks and clear video
      if (streamRef.current) {
        console.log('Cleanup: Stopping all media tracks...');
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log(`Cleanup: Stopped ${track.kind} track`);
        });
        
        // Clear video element
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        
        // Clear stream reference
        streamRef.current = null;
      }
      
      socket.disconnect();
    };
  }, [sessionId, isRecording, user]);
  // Toggle recording
  const handleToggleRecording = () => {
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      } else if (mediaRecorderRef.current.state === 'inactive') {
        mediaRecorderRef.current.start();
        setIsRecording(true);
      }
    } else {
      setIsRecording((prev) => !prev);
    }
  };

  // Toggle video
  const handleToggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    } else {
      setIsVideoOn(!isVideoOn);
    }
  };

  // Toggle audio
  const handleToggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    } else {
      setIsAudioOn(!isAudioOn);
    }
  };

  // Existing session fetch useEffect
  useEffect(() => {
    fetchSessionData();
  }, [sessionId, fetchSessionData]);

  const handleLeaveSession = () => {
    setShowLeaveModal(true);
  };

  const confirmLeaveSession = async () => {
    setShowLeaveModal(false);
    
    console.log('Starting session leave process...');
    
    // Immediately stop all media tracks to turn off camera/microphone
    if (streamRef.current) {
      console.log('Stopping media tracks...');
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped ${track.kind} track - readyState:`, track.readyState);
      });
      
      // Clear the video source
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      // Clear the stream reference
      streamRef.current = null;
    }
    
    // Stop recording if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      console.log('Stopping recording...');
      mediaRecorderRef.current.stop();
    }
    
    // Disconnect socket immediately
    socket.emit('leave-room', { roomId: sessionId, userId: user?.id || user?.username });
    
    try {
      // Call backend to leave/terminate session
      const result = await sessionAPI.smartLeaveSession(sessionId);
      
      if (result.success) {
        const action = result.data?.action || 'left';
        console.log(`Session ${action} successfully`);
        
        // Emit appropriate event for real-time updates
        if (action === 'terminated') {
          socket.emit('session-terminated', { sessionId, terminatedBy: user.id });
        } else {
          socket.emit('user-left-session', { sessionId, userId: user.id });
        }
      } else {
        console.error('Failed to leave session:', result.error);
        // Still navigate even if backend call fails
      }
    } catch (error) {
      console.error('Error leaving session:', error);
      // Still navigate even if there's an error
    }
    
    // Always disconnect socket and navigate, regardless of API result
    socket.disconnect();
    
    // Navigate immediately without delay
    navigate('/dashboard');
  };

  const cancelLeaveSession = () => {
    setShowLeaveModal(false);
  };

  // Developer helper function for complete session deletion
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.clearSession = async () => {
        if (session?.owner === user?.username) {
          try {
            const result = await sessionAPI.clearSession(sessionId);
            if (result.success) {
              console.log('Session completely deleted');
              navigate('/sessions');
            } else {
              console.error('Failed to clear session:', result.error);
            }
          } catch (error) {
            console.error('Error clearing session:', error);
          }
        } else {
          console.log('Only session owner can clear the session');
        }
      };
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete window.clearSession;
      }
    };
  }, [session, user, sessionId, navigate]);

  const copySessionId = () => {
    navigator.clipboard.writeText(sessionId);
    // You could add a toast notification here
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Session Not Found</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate('/sessions')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Manage Sessions
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Back Button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Dashboard</span>
            </button>
            
            <h1 className="text-xl font-semibold text-white">
              {session?.name || `Session ${sessionId}`}
            </h1>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-green-400 text-sm">Live</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-400">
              <Users className="w-4 h-4" />
              <span className="text-sm">{participants.length} participants</span>
            </div>
            
            <button
              onClick={copySessionId}
              className="flex items-center space-x-2 px-3 py-1 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm"
            >
              <Copy className="w-4 h-4" />
              <span>Copy ID</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Video Area */}
        <div className="flex-1 p-6 min-h-0">
          <div className="flex flex-row flex-wrap gap-4 justify-center items-center h-full w-full" style={{ height: 'calc(100vh - 200px)' }}>
            {/* Self Video (actual webcam stream) */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden" style={{ 
              width: participants.filter(p => p.id !== user?.id).length > 0 ? '48%' : '100%',
              height: participants.filter(p => p.id !== user?.id).length > 0 ? '48%' : '100%',
              minWidth: '300px',
              minHeight: '200px'
            }}>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4">
                <span className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
                  You {!isVideoOn && '(Video Off)'}
                </span>
              </div>
            </div>

            {/* Other Participants */}
            {participants
              .filter(p => p.id !== user?.id)
              .map((participant, index) => (
                <div key={participant.id || index} className="relative bg-gray-800 rounded-lg overflow-hidden" style={{ 
                  width: '48%',
                  height: '48%',
                  minWidth: '300px',
                  minHeight: '200px'
                }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white text-lg font-medium">
                          {participant.username?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <p className="text-gray-400">{participant.username || 'User'}</p>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
                      {participant.username || 'User'}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">Chat</h2>
            </div>
            <div className="flex-1 p-4">
              <div className="text-gray-400 text-sm text-center">
                No messages yet. Start the conversation!
              </div>
            </div>
            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-center space-x-4">
          {/* Recording Toggle */}
          <button
            onClick={handleToggleRecording}
            className={`p-3 rounded-full transition-colors ${isRecording ? 'bg-green-600 text-white' : 'bg-gray-700 text-white'}`}
            title={isRecording ? 'Stop Recording' : 'Start Recording'}
          >
            <Video className="w-5 h-5" />
          </button>
          {/* Video Toggle */}
          <button
            onClick={handleToggleVideo}
            className={`p-3 rounded-full transition-colors ${
              isVideoOn 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Audio Toggle */}
          <button
            onClick={handleToggleAudio}
            className={`p-3 rounded-full transition-colors ${
              isAudioOn 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Screen Share */}
          <button className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors">
            <Share className="w-5 h-5" />
          </button>

          {/* Chat Toggle */}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-3 rounded-full transition-colors ${
              showChat ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          {/* Settings */}
          <button className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors">
            <Settings className="w-5 h-5" />
          </button>

          {/* Leave/End Session */}
          <button
            onClick={handleLeaveSession}
            className={`p-3 rounded-full transition-colors ml-8 ${
              session?.owner === user?.username 
                ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={
              session?.owner === user?.username 
                ? 'End Session (Owner)' 
                : 'Leave Session'
            }
          >
            <Phone className="w-5 h-5 transform rotate-[135deg]" />
          </button>
        </div>
      </div>

      {/* Leave Session Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {session?.owner === user?.username ? 'End Session' : 'Leave Session'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {session?.owner === user?.username 
                ? 'As the session owner, ending the session will remove all participants and terminate the session for everyone. This action cannot be undone.'
                : 'Are you sure you want to leave this session? You can rejoin using the session ID if needed.'
              }
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelLeaveSession}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmLeaveSession}
                className={`px-4 py-2 text-white rounded-lg transition ${
                  session?.owner === user?.username
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {session?.owner === user?.username ? 'End Session' : 'Leave Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionRoom;