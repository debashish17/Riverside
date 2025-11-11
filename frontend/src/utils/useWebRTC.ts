// ...existing code from hooks/useWebRTC.ts...import { useEffect, useRef, useState } from "react";
import { socket } from "./socket";

/**
 * useWebRTC - Custom hook for managing local media stream and peer connection.
 * Returns: { stream, remoteStream, error, getMedia, joinRoom }
 */
export function useWebRTC() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const roomIdRef = useRef<string | null>(null);

  // Close local media (camera/mic)
  const closeMedia = (): void => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      setStream(null);
      streamRef.current = null;
    }
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((t) => t.stop());
      setRemoteStream(null);
    }
  };

  // Request local media (camera + mic)
  const getMedia = async (constraints: MediaStreamConstraints = { video: true, audio: true }): Promise<void> => {
    const safeConstraints =
      (!constraints || (constraints.video !== true && constraints.audio !== true))
        ? { video: true }
        : constraints;
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(safeConstraints);
      setStream(mediaStream);
      streamRef.current = mediaStream;
      setError(null);
    } catch (err) {
      setError(err.message || "Could not access media devices");
    }
  };

  // Join a signaling room and set up listeners
  const joinRoom = (roomId: string): void => {
    if (!roomId) return;
    roomIdRef.current = roomId;
    if (!socket.connected) socket.connect();
    socket.emit("join-room", { roomId });
  };

  // WebRTC signaling logic
  useEffect(() => {
    if (!stream) return;
    // Listen for signaling events
    socket.on("user-joined", handleUserJoined);
    socket.on("signal", handleSignal);
    return () => {
      socket.off("user-joined", handleUserJoined);
      socket.off("signal", handleSignal);
      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }
      if (remoteStream) {
        remoteStream.getTracks().forEach((t) => t.stop());
        setRemoteStream(null);
      }
    };
    // eslint-disable-next-line
  }, [stream]);

  // Handle when another user joins
  function handleUserJoined({ userId }: { userId: string }): void {
    // Create offer as initiator
    if (!peerRef.current) {
      createPeer(true);
    }
  }

  // Handle incoming signaling data
  async function handleSignal({ userId, data }: { userId: string; data: any }): Promise<void> {
    if (!peerRef.current) {
      createPeer(false);
    }
    if (data.sdp) {
      await peerRef.current.setRemoteDescription(new window.RTCSessionDescription(data.sdp));
      if (data.sdp.type === "offer") {
        const answer = await peerRef.current.createAnswer();
        await peerRef.current.setLocalDescription(answer);
        socket.emit("signal", {
          roomId: roomIdRef.current,
          data: { sdp: peerRef.current.localDescription },
        });
      }
    } else if (data.candidate) {
      try {
        await peerRef.current.addIceCandidate(new window.RTCIceCandidate(data.candidate));
      } catch (err) {
        setError("Failed to add ICE candidate: " + err.message);
      }
    }
  }

  // Create RTCPeerConnection and set up handlers
  function createPeer(isInitiator: boolean): void {
    const peer = new window.RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    peerRef.current = peer;
    // Add local tracks
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    // Handle remote stream
    const remote = new window.MediaStream();
    setRemoteStream(remote);
    peer.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => remote.addTrack(track));
    };
    // ICE candidates
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("signal", {
          roomId: roomIdRef.current,
          data: { candidate: event.candidate },
        });
      }
    };
    // Create offer if initiator
    if (isInitiator) {
      peer.createOffer()
        .then((offer) => peer.setLocalDescription(offer))
        .then(() => {
          socket.emit("signal", {
            roomId: roomIdRef.current,
            data: { sdp: peer.localDescription },
          });
        });
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }
      if (remoteStream) {
        remoteStream.getTracks().forEach((t) => t.stop());
        setRemoteStream(null);
      }
    };
    // eslint-disable-next-line
  }, []);

  return { stream, remoteStream, error, getMedia, joinRoom, closeMedia };
}
