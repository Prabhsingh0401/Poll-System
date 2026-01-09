import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const socket = io(BACKEND_URL, {
  // Do not auto-connect so components can register listeners first,
  // then initiate connection to avoid missing immediate server events.
  autoConnect: false,
  reconnection: true,
});
