import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useSocketEvent } from "../useSocket";

const MAX_NOTIFICATIONS = 30;

function timeAgo(date) {
  const diff = Math.max(0, Date.now() - new Date(date).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationCenter() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const addNotification = useCallback((notification) => {
    setItems(prev => [{ ...notification, id: `${notification.type}-${Date.now()}-${Math.random()}`, read: false }, ...prev].slice(0, MAX_NOTIFICATIONS));
  }, []);

  const onBookingUpdated = useCallback((booking) => {
    addNotification({
      type: "booking",
      title: `${booking.bookingId} ${booking.status.replaceAll("_", " ").toLowerCase()}`,
      detail: booking.mechanic?.name ? `Mechanic: ${booking.mechanic.name}` : null,
      status: booking.status,
      time: new Date().toISOString(),
      link: `/bookings/${booking._id}`
    });
  }, [addNotification]);

  const onMechanicUpdated = useCallback((mechanic) => {
    addNotification({
      type: "mechanic",
      title: `${mechanic.name} is now ${mechanic.status.replaceAll("_", " ").toLowerCase()}`,
      detail: null,
      status: mechanic.status,
      time: new Date().toISOString(),
      link: "/mechanics"
    });
  }, [addNotification]);

  useSocketEvent("bookingUpdated", onBookingUpdated);
  useSocketEvent("mechanicUpdated", onMechanicUpdated);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const unread = items.filter(i => !i.read).length;

  function markAllRead() {
    setItems(prev => prev.map(i => ({ ...i, read: true })));
  }

  function toggle() {
    setOpen(o => {
      const next = !o;
      if (next) markAllRead();
      return next;
    });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        aria-label="Notifications"
        className="relative grid h-9 w-9 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="animate-pop-in absolute right-0 z-30 mt-2 w-80 origin-top-right rounded-2xl border bg-white p-2 shadow-soft dark:border-slate-700 dark:bg-slate-800 dark:shadow-soft-dark">
          <div className="flex items-center justify-between px-3 py-2">
            <p className="text-sm font-semibold dark:text-slate-100">Notifications</p>
            {items.length > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-slate-400">
                No notifications yet. Live updates will appear here.
              </div>
            ) : (
              items.map(n => (
                <div key={n.id} className="flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-transparent" : "bg-blue-500"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-700 dark:text-slate-200">{n.title}</p>
                    {n.detail && <p className="truncate text-xs text-slate-400">{n.detail}</p>}
                    <p className="mt-0.5 text-xs text-slate-400">{timeAgo(n.time)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
