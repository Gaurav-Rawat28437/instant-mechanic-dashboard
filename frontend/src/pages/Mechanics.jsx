import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Wrench } from "lucide-react";
import { mechanicsApi, updateMechanicStatusApi } from "../services";
import StatusBadge from "../components/StatusBadge";

export default function Mechanics() {
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(true);

  async function load(){try{const r=await mechanicsApi();setItems(r.data.data)}catch(e){toast.error("Could not load mechanics")}finally{setLoading(false)}}
  useEffect(()=>{load()},[]);

  async function change(id,status){try{const r=await updateMechanicStatusApi(id,status);setItems(x=>x.map(m=>m._id===id?r.data.data:m));toast.success("Mechanic status updated")}catch(e){toast.error(e.response?.data?.message||"Update failed")}}

  return <div><div className="mb-6"><p className="text-sm text-slate-400">Team</p><h1 className="text-3xl font-bold">Mechanics</h1></div>
    {loading?<p className="text-slate-500">Loading...</p>:<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{items.map(m=><div key={m._id} className="rounded-2xl border bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-full bg-slate-100"><Wrench size={20}/></div><div><p className="font-semibold">{m.name}</p><p className="text-xs text-slate-400">{m.specialization}</p></div></div><StatusBadge status={m.status}/></div>
      <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-sm"><div><p className="text-xs text-slate-400">Jobs completed</p><b>{m.jobsCompleted}</b></div><div><p className="text-xs text-slate-400">Current job</p><b>{m.currentBooking?.bookingId || "None"}</b></div></div>
      <select value={m.status} onChange={e=>change(m._id,e.target.value)} className="mt-4 w-full rounded-xl border px-3 py-2 text-sm"><option>AVAILABLE</option><option>BUSY</option><option>ON_THE_WAY</option><option>OFFLINE</option></select>
    </div>)}</div>}
  </div>
}
