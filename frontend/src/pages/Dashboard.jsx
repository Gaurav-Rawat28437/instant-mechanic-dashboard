import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Activity, CalendarCheck, CheckCircle2, Clock3, IndianRupee, Users, UserPlus, XCircle, History } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import toast from "react-hot-toast";
import StatCard from "../components/StatCard";
import SocketListener from "../components/SocketListener";
import StatusBadge from "../components/StatusBadge";
import { StatCardSkeleton, ChartSkeleton, SkeletonBlock } from "../components/Skeleton";
import { dashboardApi } from "../services";
import { setDashboard, setDashboardLoading } from "../store";

const PIE_COLORS = ["#0f172a", "#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f43f5e"];

export default function Dashboard() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.dashboard);

  // Fetch dashboard data
  const loadData = () => {
    dispatch(setDashboardLoading(true));
    dashboardApi()
      .then((res) => dispatch(setDashboard(res.data.data)))
      .catch((err) => toast.error(err.response?.data?.message || "Could not load dashboard"))
      .finally(() => dispatch(setDashboardLoading(false)));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Number formatter for currency
  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  // Loading skeleton state
  if (loading && !data) {
    return (
      <div>
        <div className="mb-7">
          <SkeletonBlock className="h-3 w-20" />
          <SkeletonBlock className="mt-2 h-8 w-64" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <ChartSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      <SocketListener onBookingUpdate={loadData} />

      {/* Header */}
      <div className="mb-7 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-sm text-slate-400">Overview</p>
          <h1 className="text-3xl font-bold">Good evening, Admin</h1>
          <p className="mt-1 text-sm text-slate-500">Here's what is happening across operations.</p>
        </div>
        <div className="w-fit rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          ● Live updates enabled
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Bookings" value={data.totalBookings.toLocaleString()} icon={CalendarCheck} note="All-time bookings" trend={data.trends?.bookings} />
        <StatCard title="Today's Bookings" value={data.todaysBookings} icon={Clock3} note="Scheduled today" />
        <StatCard title="Completed" value={data.completedBookings.toLocaleString()} icon={CheckCircle2} note="Successfully serviced" />
        <StatCard title="Pending / Active" value={data.pendingBookings} icon={Activity} note="Requires attention" />
        <StatCard title="Cancelled" value={data.cancelledBookings} icon={XCircle} note="Cancelled bookings" />
        <StatCard title="Revenue" value={formatMoney(data.totalRevenue)} icon={IndianRupee} note="vs last month" trend={data.trends?.revenue} />
        <StatCard title="Active Mechanics" value={data.activeMechanics} icon={Users} note="Available or working" />
        <StatCard title="New Customers" value={data.newCustomers} icon={UserPlus} note="Last 30 days" />
      </div>

      {/* Analytics Charts & Activity */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="grid gap-6 sm:grid-cols-2 xl:col-span-2 xl:grid-cols-2">
          
          {/* Chart 1: Bookings */}
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold">Bookings over time</h2>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.bookingsOverTime}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" hide />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="bookings" fill="#3b82f6" stroke="#1d4ed8" fillOpacity={0.18} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 2: Revenue */}
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold">Revenue over time</h2>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.revenueOverTime}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" hide />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val) => formatMoney(val)} />
                <Area type="monotone" dataKey="revenue" fill="#10b981" stroke="#047857" fillOpacity={0.18} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 3: Status Pie */}
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold">Booking status</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={data.bookingStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {data.bookingStatus.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 4: Service Categories */}
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold">Service categories</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.serviceBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar: Recent Activity */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <History size={16} /> Recent activity
          </h2>
          {!data.recentActivity?.length ? (
            <p className="py-8 text-center text-sm text-slate-400">No recent activity yet.</p>
          ) : (
            <ul className="space-y-4">
              {data.recentActivity.map((act) => (
                <li key={act.id}>
                  <Link to={`/bookings/${act.id}`} className="block rounded-xl p-2 hover:bg-slate-50">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-slate-700">{act.bookingId}</p>
                      <StatusBadge status={act.status} />
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {act.mechanic ? `${act.mechanic} · ` : ""}
                      {new Date(act.updatedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}