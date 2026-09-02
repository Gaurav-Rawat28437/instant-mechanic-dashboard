import Booking from "../models/Booking.js";
import Mechanic from "../models/Mechanic.js";

export async function getBookings(req, res) {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
  const skip = (page - 1) * limit;
  const { search, status, sortBy = "scheduledAt", sortOrder = "desc" } = req.query;

  const filter = {};
  if (status && status !== "ALL") filter.status = status;

  if (search) {
    filter.$or = [
      { bookingId: { $regex: search, $options: "i" } },
      { "vehicle.registrationNumber": { $regex: search, $options: "i" } },
      { "vehicle.brand": { $regex: search, $options: "i" } },
      { "vehicle.model": { $regex: search, $options: "i" } }
    ];
  }

  const allowedSort = ["scheduledAt", "amount", "createdAt", "status"];
  const sortField = allowedSort.includes(sortBy) ? sortBy : "scheduledAt";
  const sort = { [sortField]: sortOrder === "asc" ? 1 : -1 };

  const [items, total] = await Promise.all([
    Booking.find(filter).populate("customer", "name email phone").populate("mechanic", "name status").sort(sort).skip(skip).limit(limit),
    Booking.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
}

export async function getBooking(req, res) {
  const booking = await Booking.findById(req.params.id).populate("customer").populate("mechanic");
  if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
  res.json({ success: true, data: booking });
}

export async function updateStatus(req, res) {
  const { status } = req.body;
  const allowed = ["PENDING", "ASSIGNED", "MECHANIC_ON_THE_WAY", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
  if (!allowed.includes(status)) return res.status(400).json({ success: false, message: "Invalid status" });

  const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true })
    .populate("customer", "name email phone")
    .populate("mechanic", "name status");

  if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

  if (booking.mechanic) {
    const mechanicStatus = status === "COMPLETED" || status === "CANCELLED" ? "AVAILABLE" :
      status === "MECHANIC_ON_THE_WAY" ? "ON_THE_WAY" : "BUSY";
    await Mechanic.findByIdAndUpdate(booking.mechanic._id, {
      status: mechanicStatus,
      ...(status === "COMPLETED" || status === "CANCELLED" ? { currentBooking: null } : { currentBooking: booking._id })
    });
  }

  req.app.get("io")?.emit("bookingUpdated", booking);
  res.json({ success: true, data: booking });
}
