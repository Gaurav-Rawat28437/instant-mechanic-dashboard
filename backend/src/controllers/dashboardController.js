import Booking from "../models/Booking.js";
import Mechanic from "../models/Mechanic.js";
import Customer from "../models/Customer.js";

export async function dashboard(req, res) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const [
    totalBookings,
    todaysBookings,
    completedBookings,
    pendingBookings,
    cancelledBookings,
    revenueResult,
    activeMechanics,
    newCustomers,
    bookingsByDate,
    revenueByDate,
    statusBreakdown,
    serviceBreakdown
  ] = await Promise.all([
    Booking.countDocuments(),
    Booking.countDocuments({ scheduledAt: { $gte: start, $lt: end } }),
    Booking.countDocuments({ status: "COMPLETED" }),
    Booking.countDocuments({ status: { $in: ["PENDING", "ASSIGNED", "MECHANIC_ON_THE_WAY", "IN_PROGRESS"] } }),
    Booking.countDocuments({ status: "CANCELLED" }),
    Booking.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
    Mechanic.countDocuments({ status: { $ne: "OFFLINE" } }),
    Customer.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 86400000) } }),
    Booking.aggregate([
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$scheduledAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    Booking.aggregate([
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$scheduledAt" } }, revenue: { $sum: "$amount" } } },
      { $sort: { _id: 1 } }
    ]),
    Booking.aggregate([{ $group: { _id: "$status", value: { $sum: 1 } } }, { $sort: { value: -1 } }]),
    Booking.aggregate([{ $group: { _id: "$service.category", value: { $sum: 1 } } }, { $sort: { value: -1 } }])
  ]);

  res.json({
    success: true,
    data: {
      totalBookings,
      todaysBookings,
      completedBookings,
      pendingBookings,
      cancelledBookings,
      totalRevenue: revenueResult[0]?.total || 0,
      activeMechanics,
      newCustomers,
      bookingsOverTime: bookingsByDate.map(x => ({ date: x._id, bookings: x.count })),
      revenueOverTime: revenueByDate.map(x => ({ date: x._id, revenue: x.revenue })),
      bookingStatus: statusBreakdown.map(x => ({ name: x._id, value: x.value })),
      serviceBreakdown: serviceBreakdown.map(x => ({ name: x._id, value: x.value }))
    }
  });
}
