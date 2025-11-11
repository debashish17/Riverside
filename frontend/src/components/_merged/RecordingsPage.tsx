import React, { useEffect, useState } from "react";
import { RootState } from '../../store';
import VideoPlayer from './VideoPlayer';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../store';
import { getRecordings, deleteRecording } from '../../store/slices/recordingSlice';
import { Video, Trash2, Calendar, HardDrive, Hash, Layers, AlertCircle, Loader2, Info, MoreVertical } from 'lucide-react';

// Recording Card Component with Toggle Menu
type Recording = {
  id?: string;
  filename: string;
  originalname?: string;
  projectId?: string;
  sessionId?: string;
  sessionName?: string;
  uploadedAt?: string;
  size?: number;
};

type RecordingCardProps = {
  rec: Recording;
  onDelete: () => void;
  isLoading: boolean;
};

const RecordingCard: React.FC<RecordingCardProps> = ({ rec, onDelete, isLoading }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'delete' | null>(null);

  return (
    <div className="p-4 relative">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-medium text-white truncate flex-1">
          {rec.originalname || rec.filename || "Recording"}
        </h3>
        
        {/* Toggle Menu Button */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all relative z-10"
          title="Show recording options"
        >
          <MoreVertical className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Dropdown Menu */}
      {showMenu && (
        <div className="absolute right-4 bottom-full mb-2 z-50">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur"></div>
            <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden min-w-[180px] shadow-2xl">
              <button
                onClick={() => {
                  setActiveTab(activeTab === 'info' ? null : 'info');
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-all text-left"
              >
                <Info className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-sm">Properties</span>
              </button>
              <div className="border-t border-zinc-800"></div>
              <button
                onClick={() => {
                  setActiveTab(activeTab === 'delete' ? null : 'delete');
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-left"
              >
                <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-sm">Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Panel */}
      {activeTab === 'info' && (
        <div className="mb-4">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur"></div>
            <div className="relative bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4">
              <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Info className="w-3.5 h-3.5" strokeWidth={1.5} />
                Properties
              </h4>
              <div className="space-y-2.5">
                {/* Project ID */}
                <div className="flex items-start gap-2">
                  <Layers className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-zinc-600">Project ID</div>
                    <div className="text-xs text-zinc-400 font-mono truncate">{rec.projectId}</div>
                  </div>
                </div>

                {/* Session Info */}
                {rec.sessionId && (
                  <div className="flex items-start gap-2">
                    <Hash className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-zinc-600">Session</div>
                      <div className="text-xs text-zinc-400 truncate">
                        {rec.sessionName || `Session ${rec.sessionId}`}
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload Date */}
                {rec.uploadedAt && (
                  <div className="flex items-start gap-2">
                    <Calendar className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-zinc-600">Uploaded</div>
                      <div className="text-xs text-zinc-400">
                        {new Date(rec.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}

                {/* File Size */}
                {rec.size && (
                  <div className="flex items-start gap-2">
                    <HardDrive className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-zinc-600">Size</div>
                      <div className="text-xs text-zinc-400">
                        {(rec.size / (1024 * 1024)).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Panel */}
      {activeTab === 'delete' && (
        <div className="mb-4">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl blur"></div>
            <div className="relative bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <h4 className="text-xs font-medium text-red-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                Confirm Deletion
              </h4>
              <p className="text-xs text-red-400/80 mb-3">
                Are you sure you want to delete this recording? This action cannot be undone.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={onDelete}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg font-medium hover:bg-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Delete
                </button>
                <button
                  onClick={() => setActiveTab(null)}
                  className="flex-1 px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 rounded-lg font-medium hover:bg-zinc-800 hover:text-white transition-all text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function RecordingsPage() {
  const dispatch = useAppDispatch();
  const { recordings, isLoading, error } = useSelector((state: RootState) => state.recording);

  useEffect(() => {
    dispatch(getRecordings());
  }, [dispatch]);

  const handleDelete = async (recordingId: string | undefined) => {
    if (!recordingId) {
      alert('Cannot delete: recording id is missing.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this recording?')) {
      await dispatch(deleteRecording(recordingId));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur"></div>
            <div className="relative w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6 text-blue-400" strokeWidth={1.5} />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-light text-white">Session Recordings</h1>
            <p className="text-sm text-zinc-500 mt-1">
              View and manage your recorded sessions
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="relative mb-8">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl blur"></div>
          <div className="relative bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4 text-red-400" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-400 mb-1">Error Loading Recordings</h3>
                <p className="text-xs text-red-400/80">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-30"></div>
          <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-blue-400 animate-spin" strokeWidth={1.5} />
                <div className="absolute inset-0 bg-blue-400/20 blur-xl"></div>
              </div>
              <p className="text-zinc-400 text-sm">Loading recordings...</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && recordings.length === 0 && !error && (
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-700/20 to-zinc-600/20 rounded-2xl blur"></div>
          <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-12">
            <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="relative mb-6">
                <div className="absolute -inset-2 bg-gradient-to-r from-zinc-700/20 to-zinc-600/20 rounded-2xl blur"></div>
                <div className="relative w-20 h-20 bg-zinc-800/50 border border-zinc-700/50 rounded-2xl flex items-center justify-center">
                  <Video className="w-10 h-10 text-zinc-600" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-xl font-light text-white mb-2">No Recordings Yet</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Start a session to automatically record! All your recordings will appear here.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recordings Grid */}
      {!isLoading && recordings.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recordings.map((rec: Recording, idx: number) => (
              <div key={rec.filename || idx} className="relative group z-0">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/20 group-hover:to-purple-500/20 rounded-2xl blur transition-all duration-300"></div>
                <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl overflow-visible">
                  
                  {/* Video Player Container */}
                  <div className="aspect-video overflow-hidden rounded-t-2xl">
                    <VideoPlayer
                      src={`http://localhost:5000/uploads/${rec.filename}`}
                      title={rec.originalname || rec.filename || "Recording"}
                      onDownload={() => {
                        const link = document.createElement('a');
                        link.href = `http://localhost:5000/uploads/${rec.filename}`;
                        link.download = rec.originalname || rec.filename;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="w-full h-full"
                    />
                  </div>

                  {/* Recording Info */}
                  <RecordingCard 
                    rec={rec} 
                    onDelete={() => handleDelete(rec.id)} 
                    isLoading={isLoading}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Footer Info */}
          <div className="mt-8 relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-700/20 to-zinc-600/20 rounded-xl blur"></div>
            <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-xl p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">
                  Total Recordings: <span className="text-white font-medium">{recordings.length}</span>
                </span>
                <span className="text-zinc-600">
                  All recordings are automatically saved
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}