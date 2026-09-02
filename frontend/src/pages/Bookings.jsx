import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import toast from "react-hot-toast";
import { bookingsApi } from "../services";
import StatusBadge from "../components/StatusBadge";

export default function Bookings() {
  const [state, setState] = useState({ data: [], pagination: {page:1,pages:1,total:0} });
  const [filters, setFilters] = useState({ search:"", status:"ALL", sortBy:"scheduledAt", sortOrder:"desc", page:1, limit:10 });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await bookingsApi(filters); setState(r.data); }
    catch(e) { toast.error(e.response?.data?.message || "Could not load bookings"); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { const t=setTimeout(load,300); return ()=>clearTimeout(t); }, [load]);

  function change(name,value) { setFilters(f=>({...f,[name]:value,...(name!=="page"?{page:1}:{})})); }

  return (
    <div>
      <div className="mb-6"><p className="text-sm text-slate-400">Operations</p><h1 className="text-3xl font-bold">Bookings</h1><p className="mt-1 text-sm text-slate-500">{state.pagination.total} total records</p></div>
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border bg-white p-4 md:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-xl border px-3"><Search size={18} className="text-slate-400"/><input value={filters.search} onChange={e=>change("search",e.target.value)} placeholder="Search booking, vehicle..." className="w-full py-2.5 outline-none"/></div>
        <select value={filters.status} onChange={e=>change("status",e.target.value)} className="rounded-xl border px-3 py-2.5 outline-none">
          <option>ALL</option><option>PENDING</option><option>ASSIGNED</option><option>MECHANIC_ON_THE_WAY</option><option>IN_PROGRESS</option><option>COMPLETED</option><option>CANCELLED</option>
        </select>
        <button onClick={()=>change("sortOrder",filters.sortOrder==="asc"?"desc":"asc")} className="flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5"><ArrowUpDown size={16}/> Sort {filters.sortOrder}</button>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-4">Booking</th><th>Customer</th><th>Vehicle</th><th>Service</th><th>Mechanic</th><th>Status</th><th>Amount</th><th>Date</th></tr></thead>
            <tbody className="divide-y">
              {loading ? <tr><td colSpan="8" className="p-12 text-center text-slate-400">Loading...</td></tr> :
              state.data.length === 0 ? <tr><td colSpan="8" className="p-12 text-center text-slate-400">No bookings found.</td></tr> :
              state.data.map(b=><tr key={b._id} className="hover:bg-slate-50">
                <td className="px-5 py-4"><Link className="font-semibold hover:underline" to={`/bookings/${b._id}`}>{b.bookingId}</Link></td>
                <td>{b.customer?.name || "—"}</td>
                <td>{b.vehicle.brand} {b.vehicle.model}<div className="text-xs text-slate-400">{b.vehicle.registrationNumber}</div></td>
                <td>{b.service.name}<div className="text-xs text-slate-400">{b.service.category}</div></td>
                <td>{b.mechanic?.name || "Unassigned"}</td>
                <td><StatusBadge status={b.status}/></td>
                <td>₹{b.amount.toLocaleString("en-IN")}</td>
                <td>{new Date(b.scheduledAt).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"})}</td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t px-5 py-4 text-sm">
          <span className="text-slate-500">Page {state.pagination.page} of {Math.max(state.pagination.pages,1)}</span>
          <div className="flex gap-2">
            <button disabled={state.pagination.page<=1} onClick={()=>change("page",state.pagination.page-1)} className="rounded-lg border p-2 disabled:opacity-40"><ChevronLeft size={18}/></button>
            <button disabled={state.pagination.page>=state.pagination.pages} onClick={()=>change("page",state.pagination.page+1)} className="rounded-lg border p-2 disabled:opacity-40"><ChevronRight size={18}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}
