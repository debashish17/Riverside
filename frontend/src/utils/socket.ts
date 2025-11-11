// utils/socket.js
import { io } from "socket.io-client";

// Connect to backend signaling server
export const socket = io("http://localhost:5000", {
  autoConnect: false, // connect manually
  transports: ["websocket"],
});
