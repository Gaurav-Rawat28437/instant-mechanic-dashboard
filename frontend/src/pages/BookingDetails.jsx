import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, CarFront, User, Wrench } from "lucide-react";
import { bookingApi, updateBookingStatusApi } from "../services";
import StatusBadge from "../components/StatusBadge";
import ConfirmModal from "../components/ConfirmModal";
import { CardSkeleton } from "../components/Skeleton";

const statuses = ["PENDING", "ASSIGNED", "MECHANIC_ON_THE_WAY", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export default function BookingDetails() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(false);

  // Fetch booking details on component mount
  useEffect(() => {
    bookingApi(id)
      .then((res) => setBooking(res.data.data))
      .catch((err) => toast.error(err.response?.data?.message || "Booking not found"))
      .finally(() => setLoading(false));
  }, [id]);

  // Update status directly
  const updateStatus = (status) => {
    updateBookingStatusApi(id, status)
      .then((res) => {
        setBooking(res.data.data);
        toast.success("Status updated");
      })
      .catch((err) => toast.error(err.response?.data?.message || "Update failed"));
  };

  if (loading) return <div className="max-w-5xl"><CardSkeleton /></div>;
  if (!booking) return <div className="p-4">Booking not found.</div>;

  return (
    <div className="max-w-5xl">
      {/* Back Button */}
      <Link to="/bookings" className="mb-5 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft size={16} /> Back to bookings
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <p className="text-sm text-slate-400">Booking</p>
          <h1 className="text-3xl font-bold">{booking.bookingId}</h1>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Info Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* Customer Info */}
        <div className="rounded-2xl border p-5 bg-white shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-slate-500">
            <User size={18} />
            <span className="text-sm font-semibold">Customer</span>
          </div>
          <div className="flex flex-col text-sm text-slate-500">
            <b className="text-black">{booking.customer.name}</b>
            <span>{booking.customer.email}</span>
            <span>{booking.customer.phone}</span>
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="rounded-2xl border p-5 bg-white shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-slate-500">
            <CarFront size={18} />
            <span className="text-sm font-semibold">Vehicle</span>
          </div>
          <div className="flex flex-col text-sm text-slate-500">
            <b className="text-black">{booking.vehicle.brand} {booking.vehicle.model}</b>
            <span>{booking.vehicle.registrationNumber}</span>
            <span>{booking.vehicle.year}</span>
          </div>
        </div>

        {/* Mechanic Info */}
        <div className="rounded-2xl border p-5 bg-white shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-slate-500">
            <Wrench size={18} />
            <span className="text-sm font-semibold">Mechanic</span>
          </div>
          <div className="flex flex-col text-sm text-slate-500">
            {booking.mechanic ? (
              <Link to={`/mechanics/${booking.mechanic._id}`} className="font-bold text-black hover:underline">
                {booking.mechanic.name}
              </Link>
            ) : (
              <b className="text-black">Unassigned</b>
            )}
            <span>{booking.mechanic?.status?.replaceAll("_", " ") || "Waiting for assignment"}</span>
          </div>
        </div>
      </div>

      {/* Details & Status Change */}
      <div className="mt-5 rounded-2xl border bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <p className="text-xs text-slate-400">Service</p>
            <p className="mt-1 font-semibold">{booking.service.name}</p>
            <p className="text-sm text-slate-500">{booking.service.category}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Scheduled</p>
            <p className="mt-1 font-semibold">{new Date(booking.scheduledAt).toLocaleString("en-IN")}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Amount</p>
            <p className="mt-1 text-2xl font-bold">₹{booking.amount.toLocaleString("en-IN")}</p>
          </div>
        </div>

        {/* Status Buttons */}
        <div className="mt-8 border-t pt-6">
          <p className="mb-3 font-semibold">Update status</p>
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => (status === "CANCELLED" ? setCancelModal(true) : updateStatus(status))}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                  booking.status === status ? "bg-slate-900 text-white" : "hover:bg-slate-50"
                }`}
              >
                {status.replaceAll("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        open={cancelModal}
        title="Cancel this booking?"
        description={`${booking.bookingId} will be marked as cancelled.`}
        confirmLabel="Cancel booking"
        danger
        onCancel={() => setCancelModal(false)}
        onConfirm={() => {
          updateStatus("CANCELLED");
          setCancelModal(false);
        }}
      />
    </div>
  );
}