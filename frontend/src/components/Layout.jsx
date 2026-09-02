import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { authApi } from "../services";
import { clearUser } from "../store";
import { LayoutDashboard, CalendarDays, Wrench, Users, LogOut, CarFront } from "lucide-react";

const links = [
  ["/dashboard", "Dashboard", LayoutDashboard],
  ["/bookings", "Bookings", CalendarDays],
  ["/mechanics", "Mechanics", Wrench],
  ["/customers", "Customers", Users]
];

export default function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(s => s.auth.user);

  async function logout() {
    await authApi.logout();
    dispatch(clearUser());
    navigate("/login");
  }

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-white lg:block">
        <div className="flex h-16 items-center gap-3 border-b px-6 font-bold text-xl">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white"><CarFront size={20}/></div>
          Instant Mechanic
        </div>
        <nav className="space-y-1 p-4">
          {links.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} className={({isActive}) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`
            }><Icon size={18}/>{label}</NavLink>
          ))}
        </nav>
        <button onClick={logout} className="absolute bottom-5 left-4 right-4 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600">
          <LogOut size={18}/> Logout
        </button>
      </aside>

      <main className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white/90 px-5 backdrop-blur">
          <div>
            <p className="font-semibold">Operations Dashboard</p>
            <p className="text-xs text-slate-400">Live service monitoring</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.role}</p>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-sm font-bold text-white">{user?.name?.[0]}</div>
          </div>
        </header>
        <div className="p-5 md:p-8"><Outlet /></div>
      </main>
    </div>
  );
}
