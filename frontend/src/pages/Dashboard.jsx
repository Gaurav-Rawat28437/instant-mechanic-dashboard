import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Activity, CalendarCheck, CheckCircle2, Clock3, IndianRupee, Users, UserPlus, XCircle } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import toast from "react-hot-toast";
import StatCard from "../components/StatCard";
import SocketListener from "../components/SocketListener";
import { dashboardApi } from "../services";
import { setDashboard, setDashboardLoading } from "../store";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector(s => s.dashboard);

  const load = useCallback(async () => {
    dispatch(setDashboardLoading(true));
    try { const r = await dashboardApi(); dispatch(setDashboard(r.data.data)); }
    catch (e) { toast.error(e.response?.data?.message || "Could not load dashboard"); }
    finally { dispatch(setDashboardLoading(false)); }
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);

  if (loading && !data) return <div className="py-20 text-center text-slate-500">Loading dashboard...</div>;
  if (!data) return null;

  const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

  return (
    <>
      <SocketListener onBookingUpdate={load}/>
      <div className="mb-7 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div><p className="text-sm text-slate-400">Overview</p><h1 className="text-3xl font-bold">Good evening, Admin</h1><p className="mt-1 text-sm text-slate-500">Here’s what is happening across operations.</p></div>
        <div className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">● Live updates enabled</div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Bookings" value={data.totalBookings.toLocaleString()} icon={CalendarCheck} note="All-time bookings"/>
        <StatCard title="Today's Bookings" value={data.todaysBookings} icon={Clock3} note="Scheduled today"/>
        <StatCard title="Completed" value={data.completedBookings.toLocaleString()} icon={CheckCircle2} note="Successfully serviced"/>
        <StatCard title="Pending / Active" value={data.pendingBookings} icon={Activity} note="Requires attention"/>
        <StatCard title="Cancelled" value={data.cancelledBookings} icon={XCircle} note="Cancelled bookings"/>
        <StatCard title="Revenue" value={money.format(data.totalRevenue)} icon={IndianRupee} note="Gross booking value"/>
        <StatCard title="Active Mechanics" value={data.activeMechanics} icon={Users} note="Available or working"/>
        <StatCard title="New Customers" value={data.newCustomers} icon={UserPlus} note="Last 30 days"/>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Chart title="Bookings over time">
          <ResponsiveContainer width="100%" height={280}><AreaChart data={data.bookingsOverTime}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="date" hide/><YAxis/><Tooltip/><Area type="monotone" dataKey="bookings" fill="#cbd5e1" stroke="#0f172a" fillOpacity={0.6}/></AreaChart></ResponsiveContainer>
        </Chart>
        <Chart title="Revenue over time">
          <ResponsiveContainer width="100%" height={280}><AreaChart data={data.revenueOverTime}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="date" hide/><YAxis/><Tooltip formatter={v=>money.format(v)}/><Area type="monotone" dataKey="revenue" fill="#e2e8f0" stroke="#334155" fillOpacity={0.8}/></AreaChart></ResponsiveContainer>
        </Chart>
        <Chart title="Booking status">
          <ResponsiveContainer width="100%" height={280}><PieChart><Pie data={data.bookingStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>{data.bookingStatus.map((_,i)=><Cell key={i}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer>
        </Chart>
        <Chart title="Service categories">
          <ResponsiveContainer width="100%" height={280}><BarChart data={data.serviceBreakdown} layout="vertical"><CartesianGrid strokeDasharray="3 3" horizontal={false}/><XAxis type="number"/><YAxis type="category" dataKey="name" width={100}/><Tooltip/><Bar dataKey="value" radius={[0,6,6,0]}/></BarChart></ResponsiveContainer>
        </Chart>
      </div>
    </>
  );
}

function Chart({title, children}) {
  return <div className="rounded-2xl border bg-white p-5 shadow-soft"><h2 className="mb-4 font-semibold">{title}</h2>{children}</div>;
}
