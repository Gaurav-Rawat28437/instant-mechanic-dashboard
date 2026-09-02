import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Wrench, Users } from "lucide-react";
import { mechanicsApi, updateMechanicStatusApi } from "../services";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import { CardSkeleton } from "../components/Skeleton";

export default function Mechanics() {
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch list of mechanics
  useEffect(() => {
    mechanicsApi()
      .then((res) => setMechanics(res.data.data))
      .catch(() => toast.error("Could not load mechanics"))
      .finally(() => setLoading(false));
  }, []);

  // Update status for a specific mechanic
  const handleStatusChange = (id, status) => {
    updateMechanicStatusApi(id, status)
      .then((res) => {
        setMechanics((prev) => prev.map((m) => (m._id === id ? res.data.data : m)));
        toast.success("Mechanic status updated");
      })
      .catch((err) => toast.error(err.response?.data?.message || "Update failed"));
  };

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-slate-400">Team</p>
        <h1 className="text-3xl font-bold">Mechanics</h1>
      </div>

      {/* Mechanics Grid or Empty State */}
      {mechanics.length === 0 ? (
        <div className="rounded-2xl border bg-white">
          <EmptyState
            icon={Users}
            title="No mechanics yet"
            description="Mechanics you add to the team will show up here."
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {mechanics.map((m) => (
            <div key={m._id} className="rounded-2xl border bg-white p-5 shadow-sm">
              
              {/* Profile Info & Badge */}
              <div className="flex items-start justify-between">
                <Link to={`/mechanics/${m._id}`} className="flex items-center gap-3 group">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-slate-100">
                    <Wrench size={20} />
                  </div>
                  <div>
                    <p className="font-semibold group-hover:underline">{m.name}</p>
                    <p className="text-xs text-slate-400">{m.specialization}</p>
                  </div>
                </Link>
                <StatusBadge status={m.status} />
              </div>

              {/* Jobs Summary */}
              <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Jobs completed</p>
                  <b className="text-black">{m.jobsCompleted}</b>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Current job</p>
                  <b className="text-black">{m.currentBooking?.bookingId || "None"}</b>
                </div>
              </div>

              {/* Status Selector */}
              <select
                value={m.status}
                onChange={(e) => handleStatusChange(m._id, e.target.value)}
                className="mt-4 w-full rounded-xl border px-3 py-2 text-sm outline-none bg-white"
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="BUSY">BUSY</option>
                <option value="ON_THE_WAY">ON_THE_WAY</option>
                <option value="OFFLINE">OFFLINE</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}