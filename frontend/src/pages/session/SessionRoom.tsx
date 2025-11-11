// Session Room page component
import React, { useEffect, useState, useCallback } from 'react';
import type { RootState } from '../../store';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { sessionAPI, recordingAPI } from '../../utils/api';
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
  ArrowLeft,
  Circle,
  Maximize2,
  Send
} from 'lucide-react';

const SessionRoom = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const recordedChunksRef = React.useRef<Blob[]>([]);
  const streamRef = React.useRef<MediaStream | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  
  interface Participant {
    id?: string;
    username?: string;
  }
  interface Session {
    id?: string;
    name?: string;
    owner?: string;
    participants?: Participant[];
  }
  interface Message {
    text: string;
    sender: string;
    timestamp?: string;
  }
  const [session, setSession] = useState<Session | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const fetchSessionData = useCallback(async (retryCount = 0) => {
    try {
      setIsLoading(true);
      setError('');
      
      const result = await sessionAPI.getSession(sessionId);

      if (result.success) {
        setSession(result.data);
        setParticipants(result.data?.participants || []);
        console.log('✅ Session loaded:', result.data?.name || `Session ${sessionId}`);
      } else {
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
      setError((err as Error).message);
      console.error('❌ Error fetching session:', err);
    } finally {
      if (retryCount === 0) {
        setIsLoading(false);
      }
    }
  }, [sessionId]);

  useEffect(() => {
    const startMediaAndRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
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

    if (!socket.connected) socket.connect();
    socket.emit('join-room', { roomId: sessionId, userId: user?.id || user?.username });
    socket.on('participants-update', setParticipants);
    socket.on('message', (msg) => setMessages((prev) => [...prev, msg]));

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.onstop = async () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });

          // Use chunked upload for files larger than 10MB, otherwise use regular upload
          const useChunkedUpload = blob.size > 10 * 1024 * 1024; // 10MB threshold

          try {
            setIsUploading(true);
            console.log(`📤 Uploading recording (${(blob.size / 1024 / 1024).toFixed(2)} MB, ${useChunkedUpload ? 'chunked' : 'direct'} upload)...`);

            if (useChunkedUpload) {
              // Use chunked upload for large files
              const result = await recordingAPI.uploadRecordingChunked(
                blob,
                {
                  sessionId: sessionId || '',
                  sessionName: session?.name || `Session ${sessionId || 'unknown'}`
                },
                (progress, current, total) => {
                  setUploadProgress(progress);
                  console.log(`📤 Upload progress: ${progress}% (chunk ${current}/${total})`);
                }
              );

              if (result.success) {
                console.log('✅ Recording uploaded successfully (chunked)');
              } else {
                console.error('❌ Chunked upload failed:', result.error);
              }
            } else {
              // Use direct upload for smaller files
              const formData = new FormData();
              formData.append('recording', blob, `session-${sessionId || 'unknown'}-${Date.now()}.webm`);
              formData.append('sessionId', sessionId || '');
              formData.append('sessionName', session?.name || `Session ${sessionId || 'unknown'}`);

              const response = await fetch('/api/recordings/upload', {
                method: 'POST',
                headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
                body: formData
              });

              if (response.ok) {
                console.log('✅ Recording uploaded successfully (direct)');
              } else {
                console.error('❌ Direct upload failed:', await response.text());
              }
            }
          } catch (error) {
            console.error('❌ Failed to upload recording:', error);
          } finally {
            setIsUploading(false);
            setUploadProgress(0);
          }
        };
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        if (videoRef.current) videoRef.current.srcObject = null;
        streamRef.current = null;
      }

      socket.disconnect();
    };
  }, [sessionId, isRecording, user]);

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

  useEffect(() => {
    fetchSessionData();
  }, [sessionId, fetchSessionData]);

  const handleLeaveSession = () => {
    setShowLeaveModal(true);
  };

  const confirmLeaveSession = async () => {
    setShowLeaveModal(false);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      streamRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    socket.emit('leave-room', { roomId: sessionId, userId: user?.id || user?.username });

    try {
      // Use leaveSession if not owner, or endSession if owner
      const isOwner = session?.owner === user?.username;
      const result = isOwner
        ? await sessionAPI.endSession(sessionId || '')
        : await sessionAPI.leaveSession(sessionId || '');

      if (result.success) {
        if (isOwner) {
          socket.emit('session-terminated', { sessionId, terminatedBy: user?.id });
        } else {
          socket.emit('user-left-session', { sessionId, userId: user?.id });
        }
      }
    } catch (error) {
      console.error('Error leaving session:', error);
    }

    socket.disconnect();
    navigate('/dashboard');
  };

  const cancelLeaveSession = () => {
    setShowLeaveModal(false);
  };

  const copySessionId = () => {
    navigator.clipboard.writeText(sessionId || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate grid layout based on participant count
  const getGridLayout = () => {
    const totalParticipants = participants.length;
    if (totalParticipants === 1) return 'grid-cols-1';
    if (totalParticipants === 2) return 'grid-cols-2';
    if (totalParticipants <= 4) return 'grid-cols-2';
    if (totalParticipants <= 6) return 'grid-cols-3';
    return 'grid-cols-3';
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-zinc-700 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-sm">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-light text-white mb-4">Session Not Found</h1>
          <p className="text-zinc-500 mb-8 text-sm">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-white text-black rounded-xl font-medium hover:bg-zinc-100 transition-all"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate('/sessions')}
              className="px-6 py-3 bg-zinc-800/50 border border-zinc-700/50 text-white rounded-xl font-medium hover:bg-zinc-800 transition-all"
            >
              Manage Sessions
            </button>
          </div>
        </div>
      </div>
    );
  }

  const otherParticipants = participants.filter(p => p.id !== user?.id);

  return (
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-zinc-900/40 backdrop-blur-xl border-b border-zinc-800/50 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="group flex items-center gap-2 px-3 py-2 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={1.5} />
              <span className="text-sm font-medium">Dashboard</span>
            </button>
            
            <div>
              <h1 className="text-lg font-medium text-white">
                {session?.name || `Session ${sessionId}`}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Circle className="w-2 h-2 fill-green-400 text-green-400 animate-pulse" />
                <span className="text-green-400 text-xs font-medium">Live Recording</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800/30 border border-zinc-700/50 rounded-lg">
              <Users className="w-4 h-4 text-zinc-500" strokeWidth={1.5} />
              <span className="text-sm text-zinc-400">{participants.length}</span>
            </div>
            
            <button
              onClick={copySessionId}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 text-zinc-400 hover:text-white rounded-lg transition-all text-sm font-medium"
            >
              <Copy className="w-4 h-4" strokeWidth={1.5} />
              <span>{copied ? 'Copied!' : 'Copy ID'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Grid Background for video area */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Video Area */}
        <div className="flex-1 p-6 min-h-0 overflow-auto relative z-10">
          <div className={`grid ${getGridLayout()} gap-4 h-full ${participants.length === 1 ? 'place-items-center' : ''}`}>
            {/* Self Video */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-zinc-900 border border-zinc-800/50 rounded-2xl overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                {!isVideoOn && (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white text-xl font-medium">
                          {user?.username?.[0]?.toUpperCase() || 'Y'}
                        </span>
                      </div>
                      <p className="text-zinc-500 text-sm">Camera Off</p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="px-3 py-1.5 bg-black/70 backdrop-blur-sm text-white text-xs rounded-lg font-medium border border-zinc-700/50">
                    You
                  </span>
                  <div className="flex items-center gap-2">
                    {!isAudioOn && (
                      <div className="p-1.5 bg-red-500/20 border border-red-500/50 rounded-lg">
                        <MicOff className="w-3 h-3 text-red-400" strokeWidth={2} />
                      </div>
                    )}
                    {isRecording && (
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/20 border border-red-500/50 rounded-lg">
                        <Circle className="w-2 h-2 fill-red-400 text-red-400 animate-pulse" />
                        <span className="text-xs text-red-400 font-medium">REC</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Other Participants */}
            {otherParticipants.map((participant, index) => (
              <div key={participant.id || index} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-700/20 to-zinc-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-zinc-900 border border-zinc-800/50 rounded-2xl overflow-hidden aspect-video">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white text-xl font-semibold">
                          {participant.username?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-sm font-medium">{participant.username || 'User'}</p>
                      <p className="text-zinc-600 text-xs mt-1">Waiting for stream...</p>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1.5 bg-black/70 backdrop-blur-sm text-white text-xs rounded-lg font-medium border border-zinc-700/50">
                      {participant.username || 'User'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-zinc-900/60 backdrop-blur-xl border-l border-zinc-800/50 flex flex-col">
            <div className="p-4 border-b border-zinc-800/50">
              <h2 className="text-lg font-medium text-white">Chat</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Session messages</p>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 text-zinc-700 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-zinc-600 text-sm">No messages yet</p>
                    <p className="text-zinc-700 text-xs mt-1">Start the conversation!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg, idx) => (
                    <div key={idx} className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3">
                      <p className="text-white text-sm">{msg.text}</p>
                      <p className="text-zinc-600 text-xs mt-1">{msg.sender}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-zinc-800/50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 text-white placeholder-zinc-600 rounded-lg focus:outline-none focus:border-zinc-600 transition-all text-sm"
                />
                <button className="p-2.5 bg-white text-black rounded-lg hover:bg-zinc-100 transition-all">
                  <Send className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="bg-zinc-900/60 backdrop-blur-xl border-t border-zinc-800/50 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-center gap-3">
          {/* Recording Toggle */}
          <button
            onClick={handleToggleRecording}
            className={`group relative p-4 rounded-xl transition-all ${
              isRecording 
                ? 'bg-red-500/20 border border-red-500/50 text-red-400' 
                : 'bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:text-white hover:border-zinc-600'
            }`}
            title={isRecording ? 'Stop Recording' : 'Start Recording'}
          >
            {isRecording && (
              <div className="absolute inset-0 bg-red-500/10 rounded-xl blur"></div>
            )}
            <Circle className={`w-5 h-5 relative z-10 ${isRecording ? 'fill-red-400' : ''}`} strokeWidth={1.5} />
          </button>

          {/* Video Toggle */}
          <button
            onClick={handleToggleVideo}
            className={`p-4 rounded-xl transition-all ${
              isVideoOn 
                ? 'bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:text-white hover:border-zinc-600' 
                : 'bg-red-500/20 border border-red-500/50 text-red-400'
            }`}
            title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {isVideoOn ? <Video className="w-5 h-5" strokeWidth={1.5} /> : <VideoOff className="w-5 h-5" strokeWidth={2} />}
          </button>

          {/* Audio Toggle */}
          <button
            onClick={handleToggleAudio}
            className={`p-4 rounded-xl transition-all ${
              isAudioOn 
                ? 'bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:text-white hover:border-zinc-600' 
                : 'bg-red-500/20 border border-red-500/50 text-red-400'
            }`}
            title={isAudioOn ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {isAudioOn ? <Mic className="w-5 h-5" strokeWidth={1.5} /> : <MicOff className="w-5 h-5" strokeWidth={2} />}
          </button>

          <div className="w-px h-8 bg-zinc-800"></div>

          {/* Screen Share */}
          <button className="p-4 bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:text-white hover:border-zinc-600 rounded-xl transition-all" title="Share Screen">
            <Share className="w-5 h-5" strokeWidth={1.5} />
          </button>

          {/* Chat Toggle */}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-4 rounded-xl transition-all ${
              showChat 
                ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400' 
                : 'bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:text-white hover:border-zinc-600'
            }`}
            title="Toggle Chat"
          >
            <MessageSquare className="w-5 h-5" strokeWidth={1.5} />
          </button>

          {/* Settings */}
          <button className="p-4 bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:text-white hover:border-zinc-600 hover:rotate-90 rounded-xl transition-all" title="Settings">
            <Settings className="w-5 h-5" strokeWidth={1.5} />
          </button>

          <div className="w-px h-8 bg-zinc-800"></div>

          {/* Leave/End Session */}
          <button
            onClick={handleLeaveSession}
            className="group relative p-4 bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 rounded-xl transition-all ml-2"
            title={session?.owner === user?.username ? 'End Session (Owner)' : 'Leave Session'}
          >
            <Phone className="w-5 h-5 transform rotate-[135deg]" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Leave Session Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative max-w-md w-full mx-4">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl blur"></div>
            <div className="relative bg-zinc-900 border border-zinc-800/50 rounded-2xl p-6">
              <h3 className="text-xl font-medium text-white mb-3">
                {session?.owner === user?.username ? 'End Session' : 'Leave Session'}
              </h3>
              <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                {session?.owner === user?.username
                  ? 'As the session owner, ending the session will remove all participants and terminate the session for everyone. This action cannot be undone.'
                  : 'Are you sure you want to leave this session? You can rejoin using the session ID if needed.'
                }
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelLeaveSession}
                  className="flex-1 px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 text-white rounded-xl hover:bg-zinc-800 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLeaveSession}
                  className={`flex-1 px-4 py-3 text-white rounded-xl transition-all font-medium ${
                    session?.owner === user?.username
                      ? 'bg-orange-500 hover:bg-orange-600'
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {session?.owner === user?.username ? 'End Session' : 'Leave Session'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress Modal */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative max-w-md w-full mx-4">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur"></div>
            <div className="relative bg-zinc-900 border border-zinc-800/50 rounded-2xl p-6">
              <h3 className="text-xl font-medium text-white mb-4">Uploading Recording</h3>
              <p className="text-sm text-zinc-400 mb-4">
                Please wait while your recording is being uploaded...
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-zinc-800 rounded-full h-3 mb-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Progress</span>
                <span className="text-white font-medium">{uploadProgress}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionRoom;