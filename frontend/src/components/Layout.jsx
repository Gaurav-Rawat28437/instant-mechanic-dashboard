import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { authApi } from "../services";
import { clearUser } from "../store";
import { useTheme } from "../theme";
import NotificationCenter from "./NotificationCenter";
import { LayoutDashboard, CalendarDays, Wrench, Users, LogOut, CarFront, Menu, X, Sun, Moon, Map } from "lucide-react";

const links = [
  ["/dashboard", "Dashboard", LayoutDashboard],
  ["/bookings", "Bookings", CalendarDays],
  ["/mechanics", "Mechanics", Wrench],
  ["/customers", "Customers", Users],
  ["/map", "Live Map", Map]
];

function Sidebar({ onNavigate, onLogout }) {
  return (
    <>
      <div className="flex h-16 items-center gap-3 border-b px-6 text-xl font-bold dark:border-slate-800">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
          <CarFront size={20} />
        </div>
        Instant Mechanic
      </div>
      <nav className="space-y-1 p-4">
        {links.map(([to, label, Icon]) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={onLogout}
        className="absolute bottom-5 left-4 right-4 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-500/10 dark:hover:text-red-400"
      >
        <LogOut size={18} /> Logout
      </button>
    </>
  );
}

export default function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(s => s.auth.user);
  const { dark, toggle } = useTheme();
  const [navOpen, setNavOpen] = useState(false);

  async function logout() {
    await authApi.logout();
    dispatch(clearUser());
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] dark:bg-[#0b1220]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-white dark:border-slate-800 dark:bg-slate-900 lg:block">
        <Sidebar onLogout={logout} />
      </aside>

      {/* Mobile drawer */}
      {navOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-black/40" onClick={() => setNavOpen(false)} />
          <aside className="relative z-10 h-full w-72 animate-slide-in border-r bg-white dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => setNavOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <X size={18} />
            </button>
            <Sidebar onNavigate={() => setNavOpen(false)} onLogout={logout} />
          </aside>
        </div>
      )}

      <main className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:px-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setNavOpen(true)}
              aria-label="Open menu"
              className="grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div>
              <p className="font-semibold dark:text-slate-100">Operations Dashboard</p>
              <p className="hidden text-xs text-slate-400 sm:block">Live service monitoring</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggle}
              aria-label="Toggle dark mode"
              className="grid h-9 w-9 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <NotificationCenter />
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold dark:text-slate-100">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.role}</p>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-sm font-bold text-white dark:bg-white dark:text-slate-900">
              {user?.name?.[0]}
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-5 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
