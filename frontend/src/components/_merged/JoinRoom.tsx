import React, { useState, useEffect } from "react";
import { socket } from "../../utils/socket";
import { Users, Link as LinkIcon, Copy } from 'lucide-react';
import StatusMessage from './StatusMessage';

interface Participant {
	id: string;
	username?: string;
}

interface LogEntry {
	message: string;
	timestamp: string;
}

export default function JoinRoom({ onRoomJoined }: { onRoomJoined?: (roomId: string) => void }) {
	const [roomId, setRoomId] = useState("");
	const [connected, setConnected] = useState(false);
	const [log, setLog] = useState<LogEntry[]>([]);
	const [participants, setParticipants] = useState<Participant[]>([]);
	const [error, setError] = useState('');

	const addLog = (message: string) => {
		setLog(prev => [...prev, { message, timestamp: new Date().toLocaleTimeString() }]);
	};

	const handleJoin = () => {
		if (!roomId.trim()) {
			setError('Please enter a room ID');
			return;
		}
    
		setError('');
    
		if (!socket.connected) {
			socket.connect();
		}
    
		socket.emit("join-room", { roomId: roomId.trim() });
		addLog(`Joining room: ${roomId}`);
		setConnected(true);
    
		if (onRoomJoined) {
			onRoomJoined(roomId.trim());
		}
	};

	const handleLeave = () => {
		if (roomId && connected) {
			socket.emit("leave-room", { roomId });
			addLog(`Left room: ${roomId}`);
			setConnected(false);
			setParticipants([]);
		}
	};

	const copyRoomId = () => {
		if (roomId) {
			navigator.clipboard.writeText(roomId);
			addLog('Room ID copied to clipboard');
		}
	};

	useEffect(() => {
		function onUserJoined({ userId }: { userId: string }) {
			addLog(`User joined: ${userId}`);
			setParticipants(prev => {
				if (!prev.find(p => p.id === userId)) {
					return [...prev, { id: userId, username: userId }];
				}
				return prev;
			});
		}

		function onUserLeft({ userId }: { userId: string }) {
			addLog(`User left: ${userId}`);
			setParticipants(prev => prev.filter(p => p.id !== userId));
		}

		function onRoomUpdate({ participants: roomParticipants }: { participants?: Participant[] }) {
			setParticipants(roomParticipants || []);
		}

		function onConnect() {
			addLog('Connected to server');
		}

		function onDisconnect() {
			addLog('Disconnected from server');
			setConnected(false);
		}

		socket.on("user-joined", onUserJoined);
		socket.on("user-left", onUserLeft);
		socket.on("room-update", onRoomUpdate);
		socket.on("connect", onConnect);
		socket.on("disconnect", onDisconnect);

		return () => {
			socket.off("user-joined", onUserJoined);
			socket.off("user-left", onUserLeft);
			socket.off("room-update", onRoomUpdate);
			socket.off("connect", onConnect);
			socket.off("disconnect", onDisconnect);
		};
	}, []);

	return (
		<div className="max-w-2xl mx-auto p-6">
			<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
				<div className="p-6">
					<div className="text-center mb-6">
						<div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
							<LinkIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
						</div>
						<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
							Join Room
						</h2>
						<p className="text-gray-600 dark:text-gray-400">
							Enter a room ID to connect with others
						</p>
					</div>

					{/* Room Input */}
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Room ID
							</label>
							<div className="flex space-x-2">
								<input
									type="text"
									value={roomId}
									onChange={(e) => setRoomId(e.target.value)}
									placeholder="Enter room ID"
									className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									disabled={connected}
								/>
								{roomId && (
									<button
										onClick={copyRoomId}
										className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
										title="Copy room ID"
									>
										<Copy className="w-5 h-5" />
									</button>
								)}
							</div>
						</div>

						{error && (
							<StatusMessage type="error" message={error} />
						)}

						{/* Action Buttons */}
						<div className="flex space-x-3">
							{!connected ? (
								<button
									onClick={handleJoin}
									disabled={!roomId.trim()}
									className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
								>
									Join Room
								</button>
							) : (
								<button
									onClick={handleLeave}
									className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
								>
									Leave Room
								</button>
							)}
						</div>
					</div>

					{/* Participants */}
					{connected && (
						<div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
							<div className="flex items-center space-x-2 mb-4">
								<Users className="w-5 h-5 text-gray-500 dark:text-gray-400" />
								<h3 className="text-lg font-medium text-gray-900 dark:text-white">
									Participants ({participants.length})
								</h3>
							</div>
              
							{participants.length > 0 ? (
								<div className="space-y-2">
									{participants.map((participant) => (
										<div
											key={participant.id}
											className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
										>
											<div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
												<span className="text-white text-sm font-medium">
													{participant.username?.[0]?.toUpperCase() || 'U'}
												</span>
											</div>
											<span className="text-gray-900 dark:text-white">
												{participant.username || participant.id}
											</span>
										</div>
									))}
								</div>
							) : (
								<p className="text-gray-500 dark:text-gray-400 text-sm">
									No other participants in this room
								</p>
							)}
						</div>
					)}

					{/* Activity Log */}
					{log.length > 0 && (
						<div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
							<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
								Activity Log
							</h3>
							<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-40 overflow-y-auto">
								<div className="space-y-1">
									{log.map((entry, index) => (
										<div key={index} className="text-sm text-gray-600 dark:text-gray-300">
											<span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
												{entry.timestamp}
											</span>
											{entry.message}
										</div>
									))}
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
// ...existing code from components/common/JoinRoom.ts...