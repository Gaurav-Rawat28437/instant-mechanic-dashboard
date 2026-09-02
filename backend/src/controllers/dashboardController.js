import Booking from "../models/Booking.js";
import Mechanic from "../models/Mechanic.js";
import Customer from "../models/Customer.js";

export async function dashboard(req, res) {
  // Today's start: 00:00:00
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  // Tomorrow's start
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  // First day of current month
  const monthStart = new Date(
    start.getFullYear(),
    start.getMonth(),
    1
  );

  // First day of previous month
  const lastMonthStart = new Date(
    start.getFullYear(),
    start.getMonth() - 1,
    1
  );

  // Last 7 days
  const weekStart = new Date(start);
  weekStart.setDate(weekStart.getDate() - 7);

  // Last 14 days
  const twoWeeksStart = new Date(start);
  twoWeeksStart.setDate(twoWeeksStart.getDate() - 14);

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
    serviceBreakdown,
    revenueThisMonth,
    revenueLastMonth,
    bookingsThisWeek,
    bookingsLastWeek,
    recentActivity
  ] = await Promise.all([
    // Total bookings
    Booking.countDocuments(),

    // Today's bookings
    Booking.countDocuments({
      scheduledAt: {
        $gte: start,
        $lt: end
      }
    }),

    // Completed bookings
    Booking.countDocuments({
      status: "COMPLETED"
    }),

    // Pending / active bookings
    Booking.countDocuments({
      status: {
        $in: [
          "PENDING",
          "ASSIGNED",
          "MECHANIC_ON_THE_WAY",
          "IN_PROGRESS"
        ]
      }
    }),

    // Cancelled bookings
    Booking.countDocuments({
      status: "CANCELLED"
    }),

    // Total revenue
    Booking.aggregate([
      {
        $group: {
          _id: null,
          total: {
            $sum: "$amount"
          }
        }
      }
    ]),

    // Active mechanics
    Mechanic.countDocuments({
      status: {
        $ne: "OFFLINE"
      }
    }),

    // Customers created in the last 30 days
    Customer.countDocuments({
      createdAt: {
        $gte: new Date(Date.now() - 30 * 86400000)
      }
    }),

    // Bookings grouped by date
    Booking.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$scheduledAt"
            }
          },
          count: {
            $sum: 1
          }
        }
      },
      {
        $sort: {
          _id: 1
        }
      }
    ]),

    // Revenue grouped by date
    Booking.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$scheduledAt"
            }
          },
          revenue: {
            $sum: "$amount"
          }
        }
      },
      {
        $sort: {
          _id: 1
        }
      }
    ]),

    // Booking status breakdown
    Booking.aggregate([
      {
        $group: {
          _id: "$status",
          value: {
            $sum: 1
          }
        }
      },
      {
        $sort: {
          value: -1
        }
      }
    ]),

    // Service category breakdown
    Booking.aggregate([
      {
        $group: {
          _id: "$service.category",
          value: {
            $sum: 1
          }
        }
      },
      {
        $sort: {
          value: -1
        }
      }
    ]),

    // Revenue this month
    Booking.aggregate([
      {
        $match: {
          scheduledAt: {
            $gte: monthStart
          }
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$amount"
          }
        }
      }
    ]),

    // Revenue last month
    Booking.aggregate([
      {
        $match: {
          scheduledAt: {
            $gte: lastMonthStart,
            $lt: monthStart
          }
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$amount"
          }
        }
      }
    ]),

    // Bookings in the last 7 days
    Booking.countDocuments({
      scheduledAt: {
        $gte: weekStart,
        $lt: end
      }
    }),

    // Bookings from 7-14 days ago
    Booking.countDocuments({
      scheduledAt: {
        $gte: twoWeeksStart,
        $lt: weekStart
      }
    }),

    // Recent activity
    Booking.find()
      .sort({
        updatedAt: -1
      })
      .limit(8)
      .populate("mechanic", "name")
      .select(
        "bookingId status mechanic updatedAt"
      )
  ]);

  // Calculate percentage change
  const pctChange = (curr, prev) => {
    if (!prev) {
      return curr > 0 ? 100 : 0;
    }

    return Math.round(
      ((curr - prev) / prev) * 1000
    ) / 10;
  };

  // Revenue totals
  const revenueThisMonthTotal =
    revenueThisMonth[0]?.total || 0;

  const revenueLastMonthTotal =
    revenueLastMonth[0]?.total || 0;

  // Send dashboard data
  res.json({
    success: true,

    data: {
      totalBookings,

      todaysBookings,

      completedBookings,

      pendingBookings,

      cancelledBookings,

      totalRevenue:
        revenueResult[0]?.total || 0,

      activeMechanics,

      newCustomers,

      bookingsOverTime:
        bookingsByDate.map((x) => ({
          date: x._id,
          bookings: x.count
        })),

      revenueOverTime:
        revenueByDate.map((x) => ({
          date: x._id,
          revenue: x.revenue
        })),

      bookingStatus:
        statusBreakdown.map((x) => ({
          name: x._id,
          value: x.value
        })),

      serviceBreakdown:
        serviceBreakdown.map((x) => ({
          name: x._id,
          value: x.value
        })),

      trends: {
        revenue: pctChange(
          revenueThisMonthTotal,
          revenueLastMonthTotal
        ),

        bookings: pctChange(
          bookingsThisWeek,
          bookingsLastWeek
        )
      },

      recentActivity:
        recentActivity.map((b) => ({
          id: b._id,
          bookingId: b.bookingId,
          status: b.status,
          mechanic: b.mechanic?.name || null,
          updatedAt: b.updatedAt
        }))
    }
  });
}