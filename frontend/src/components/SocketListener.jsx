import { useEffect } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

export default function SocketListener({ onBookingUpdate }) {
  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL, { withCredentials: true });
    socket.on("bookingUpdated", booking => {
      toast.success(`${booking.bookingId} updated to ${booking.status.replaceAll("_"," ")}`);
      onBookingUpdate?.(booking);
    });
    return () => socket.disconnect();
  }, [onBookingUpdate]);
  return null;
}
