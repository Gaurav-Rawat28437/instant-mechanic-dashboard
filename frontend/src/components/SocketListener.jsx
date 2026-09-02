import toast from "react-hot-toast";
import { useSocketEvent } from "../useSocket";

export default function SocketListener({ onBookingUpdate }) {
  useSocketEvent("bookingUpdated", (booking) => {
    toast.success(`${booking.bookingId} updated to ${booking.status.replaceAll("_", " ")}`);
    onBookingUpdate?.(booking);
  });
  return null;
}
