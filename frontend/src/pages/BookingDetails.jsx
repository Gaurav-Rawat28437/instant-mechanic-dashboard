import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, CarFront, User, Wrench } from "lucide-react";
import { bookingApi, updateBookingStatusApi } from "../services";
import StatusBadge from "../components/StatusBadge";

const statuses = ["PENDING","ASSIGNED","MECHANIC_ON_THE_WAY","IN_PROGRESS","COMPLETED","CANCELLED"];

export default function BookingDetails() {
  const { id } = useParams();
  const [booking,setBooking] = useState(null);
  const [loading,setLoading] = useState(true);

  async function load() {
    try { const r=await bookingApi(id); setBooking(r.data.data); }
    catch(e) { toast.error(e.response?.data?.message || "Booking not found"); }
    finally { setLoading(false); }
  }
  useEffect(()=>{load()},[id]);

  async function changeStatus(status) {
    try { const r=await updateBookingStatusApi(id,status); setBooking(r.data.data); toast.success("Status updated"); }
    catch(e) { toast.error(e.response?.data?.message || "Update failed"); }
  }

  if(loading) return <div className="py-20 text-center text-slate-500">Loading booking...</div>;
  if(!booking) return <div>Booking not found.</div>;

  return (
    <div className="max-w-5xl">
      <Link to="/bookings" className="mb-5 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"><ArrowLeft size={16}/> Back to bookings</Link>
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center"><div><p className="text-sm text-slate-400">Booking</p><h1 className="text-3xl font-bold">{booking.bookingId}</h1></div><StatusBadge status={booking.status}/></div>
      <div className="grid gap-5 md:grid-cols-3">
        <Info icon={User} title="Customer"><b>{booking.customer.name}</b><span>{booking.customer.email}</span><span>{booking.customer.phone}</span></Info>
        <Info icon={CarFront} title="Vehicle"><b>{booking.vehicle.brand} {booking.vehicle.model}</b><span>{booking.vehicle.registrationNumber}</span><span>{booking.vehicle.year}</span></Info>
        <Info icon={Wrench} title="Mechanic"><b>{booking.mechanic?.name || "Unassigned"}</b><span>{booking.mechanic?.status || "Waiting for assignment"}</span></Info>
      </div>
      <div className="mt-5 rounded-2xl border bg-white p-6 shadow-soft">
        <div className="grid gap-5 md:grid-cols-3"><div><p className="text-xs text-slate-400">Service</p><p className="mt-1 font-semibold">{booking.service.name}</p><p className="text-sm text-slate-500">{booking.service.category}</p></div><div><p className="text-xs text-slate-400">Scheduled</p><p className="mt-1 font-semibold">{new Date(booking.scheduledAt).toLocaleString("en-IN")}</p></div><div><p className="text-xs text-slate-400">Amount</p><p className="mt-1 text-2xl font-bold">₹{booking.amount.toLocaleString("en-IN")}</p></div></div>
        <div className="mt-8 border-t pt-6"><p className="mb-3 font-semibold">Update status</p><div className="flex flex-wrap gap-2">{statuses.map(s=><button key={s} onClick={()=>changeStatus(s)} className={`rounded-xl border px-3 py-2 text-xs font-semibold ${booking.status===s?"bg-slate-900 text-white":"hover:bg-slate-50"}`}>{s.replaceAll("_"," ")}</button>)}</div></div>
      </div>
    </div>
  );
}
function Info({icon:Icon,title,children}){return <div className="rounded-2xl border bg-white p-5 shadow-soft"><div className="mb-4 flex items-center gap-2 text-slate-500"><Icon size={18}/><span className="text-sm font-semibold">{title}</span></div><div className="space-y-1 text-sm">{children}</div></div>}
