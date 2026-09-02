import { useEffect } from "react";
import { io } from "socket.io-client";

let socket = null;

function getSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL, { withCredentials: true });
  }
  return socket;
}

/**
 * Subscribe to a socket.io event for the lifetime of the component.
 * Shares a single underlying connection across the whole app.
 */
export function useSocketEvent(event, handler) {
  useEffect(() => {
    const s = getSocket();
    s.on(event, handler);
    return () => s.off(event, handler);
  }, [event, handler]);
}

export default getSocket;
