import { useEffect, useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import toast from "react-hot-toast";
import { customersApi } from "../services";

export default function Customers() {
  const [items,setItems]=useState([]);
  const [search,setSearch]=useState("");
  useEffect(()=>{customersApi().then(r=>setItems(r.data.data)).catch(()=>toast.error("Could not load customers"))},[]);
  const filtered=useMemo(()=>items.filter(x=>`${x.name} ${x.email} ${x.phone}`.toLowerCase().includes(search.toLowerCase())),[items,search]);

  return <div><div className="mb-6"><p className="text-sm text-slate-400">Customers</p><h1 className="text-3xl font-bold">Customers</h1></div>
    <div className="mb-4 flex items-center gap-2 rounded-2xl border bg-white px-4"><Search size={18} className="text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search customers..." className="w-full py-3 outline-none"/></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filtered.map(c=><div key={c._id} className="rounded-2xl border bg-white p-5 shadow-soft"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-full bg-slate-100"><Users size={19}/></div><div><p className="font-semibold">{c.name}</p><p className="text-xs text-slate-400">{c.email}</p></div></div><div className="mt-4 space-y-1 text-sm text-slate-500"><p>{c.phone}</p><p>{c.address}</p></div></div>)}</div>
  </div>
}
