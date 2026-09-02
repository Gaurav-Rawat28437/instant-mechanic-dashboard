import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Mail, Phone, Wrench, CheckCircle2, MapPin } from "lucide-react";
import { mechanicApi, updateMechanicStatusApi } from "../services";
import StatusBadge from "../components/StatusBadge";
import { CardSkeleton } from "../components/Skeleton";

const STATUSES = ["AVAILABLE", "BUSY", "ON_THE_WAY", "OFFLINE"];

export default function MechanicDetails() {
  const { id } = useParams();
  const [mechanic, setMechanic] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch mechanic profile
  useEffect(() => {
    mechanicApi(id)
      .then((res) => setMechanic(res.data.data))
      .catch((err) => toast.error(err.response?.data?.message || "Mechanic not found"))
      .finally(() => setLoading(false));
  }, [id]);

  // Handle status update
  const handleStatusChange = (status) => {
    updateMechanicStatusApi(id, status)
      .then((res) => {
        setMechanic(res.data.data);
        toast.success("Status updated");
      })
      .catch((err) => toast.error(err.response?.data?.message || "Update failed"));
  };

  if (loading) return <div className="max-w-4xl"><CardSkeleton /></div>;
  if (!mechanic) return <div className="p-4 text-slate-500">Mechanic not found.</div>;

  return (
    <div className="max-w-4xl">
      {/* Back Button */}
      <Link to="/mechanics" className="mb-5 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft size={16} /> Back to mechanics
      </Link>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-600">
              <Wrench size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{mechanic.name}</h1>
              <p className="text-sm text-slate-500">{mechanic.specialization}</p>
            </div>
          </div>
          <StatusBadge status={mechanic.status} />
        </div>

        {/* Contact Info */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm">
            <Mail size={16} className="text-slate-400" /> {mechanic.email}
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm">
            <Phone size={16} className="text-slate-400" /> {mechanic.phone}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="flex items-center gap-1.5 text-xs text-slate-400"><CheckCircle2 size={14} /> Jobs completed</p>
            <p className="mt-1 text-2xl font-bold">{mechanic.jobsCompleted}</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-400">Current job</p>
            {mechanic.currentBooking ? (
              <Link to={`/bookings/${mechanic.currentBooking._id}`} className="mt-1 block text-lg font-semibold hover:underline">
                {mechanic.currentBooking.bookingId}
              </Link>
            ) : (
              <p className="mt-1 text-lg font-semibold text-slate-400">None</p>
            )}
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="flex items-center gap-1.5 text-xs text-slate-400"><MapPin size={14} /> Location</p>
            <p className="mt-1 text-sm font-semibold">
              {mechanic.location?.lat && mechanic.location?.lng
                ? `${mechanic.location.lat.toFixed(3)}, ${mechanic.location.lng.toFixed(3)}`
                : "Not tracked"}
            </p>
          </div>
        </div>

        {/* Status Update Buttons */}
        <div className="mt-8 border-t pt-6">
          <p className="mb-3 font-semibold">Update status</p>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                  mechanic.status === status ? "bg-slate-900 text-white" : "hover:bg-slate-50"
                }`}
              >
                {status.replaceAll("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}