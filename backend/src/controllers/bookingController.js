import Booking from "../models/Booking.js";
import Mechanic from "../models/Mechanic.js";
import Customer from "../models/Customer.js";


// ========================================
// GET ALL BOOKINGS
// ========================================

export async function getBookings(req, res) {

  // Get page number
  const page = Math.max(
    Number(req.query.page) || 1,
    1
  );

  // Check if this is an export request
  const isExport = req.query.export === "true";

  // Set limit
  let limit;

  if (isExport) {
    limit = Number(req.query.limit) || 1000;

    // Maximum 5000 records for export
    limit = Math.min(Math.max(limit, 1), 5000);

  } else {
    limit = Number(req.query.limit) || 10;

    // Maximum 50 records normally
    limit = Math.min(Math.max(limit, 1), 50);
  }


  // Calculate how many records to skip
  let skip = 0;

  if (!isExport) {
    skip = (page - 1) * limit;
  }


  // Get filters from query
  const {
    search,
    status,
    service,
    mechanic,
    customer,
    dateFrom,
    dateTo,
    sortBy = "scheduledAt",
    sortOrder = "desc"
  } = req.query;


  // ========================================
  // CREATE FILTER
  // ========================================

  const filter = {};


  // Status filter
  if (status && status !== "ALL") {
    filter.status = status;
  }


  // Service filter
  if (service && service !== "ALL") {
    filter["service.category"] = service;
  }


  // Mechanic filter
  if (mechanic && mechanic !== "ALL") {
    filter.mechanic = mechanic;
  }


  // Customer filter
  if (customer && customer !== "ALL") {
    filter.customer = customer;
  }


  // ========================================
  // DATE FILTER
  // ========================================

  if (dateFrom || dateTo) {

    filter.scheduledAt = {};


    // Starting date
    if (dateFrom) {
      filter.scheduledAt.$gte = new Date(dateFrom);
    }


    // Ending date
    if (dateTo) {

      const end = new Date(dateTo);

      // Include the complete ending day
      end.setHours(23, 59, 59, 999);

      filter.scheduledAt.$lte = end;
    }
  }


  // ========================================
  // SEARCH
  // ========================================

  if (search) {

    // First find customers whose name matches search
    const matchingCustomers = await Customer.find({
      name: {
        $regex: search,
        $options: "i"
      }
    }).select("_id");


    // Search in multiple fields
    filter.$or = [

      // Booking ID
      {
        bookingId: {
          $regex: search,
          $options: "i"
        }
      },

      // Vehicle registration number
      {
        "vehicle.registrationNumber": {
          $regex: search,
          $options: "i"
        }
      },

      // Vehicle brand
      {
        "vehicle.brand": {
          $regex: search,
          $options: "i"
        }
      },

      // Vehicle model
      {
        "vehicle.model": {
          $regex: search,
          $options: "i"
        }
      }
    ];


    // Add customer search if customers were found
    if (matchingCustomers.length > 0) {

      filter.$or.push({
        customer: {
          $in: matchingCustomers.map(
            (customer) => customer._id
          )
        }
      });

    }
  }


  // ========================================
  // SORT
  // ========================================

  const allowedSort = [
    "scheduledAt",
    "amount",
    "createdAt",
    "status"
  ];


  // Check if requested sort field is allowed
  let sortField = "scheduledAt";

  if (allowedSort.includes(sortBy)) {
    sortField = sortBy;
  }


  // Set sort order
  let sortOrderValue = -1;

  if (sortOrder === "asc") {
    sortOrderValue = 1;
  }


  const sort = {
    [sortField]: sortOrderValue
  };


  // ========================================
  // GET BOOKINGS + TOTAL
  // ========================================

  const [items, total] = await Promise.all([

    // Get bookings
    Booking.find(filter)

      // Get customer information
      .populate(
        "customer",
        "name email phone"
      )

      // Get mechanic information
      .populate(
        "mechanic",
        "name status"
      )

      // Sort bookings
      .sort(sort)

      // Skip records for pagination
      .skip(skip)

      // Limit number of records
      .limit(limit),


    // Count total matching bookings
    Booking.countDocuments(filter)

  ]);


  // ========================================
  // SEND RESPONSE
  // ========================================

  res.json({
    success: true,

    data: items,

    pagination: {
      page: page,
      limit: limit,
      total: total,
      pages: Math.ceil(total / limit)
    }
  });
}


// ========================================
// GET FILTER OPTIONS
// ========================================

export async function getBookingFilterOptions(
  _req,
  res
) {

  // Get all different service categories
  const categories = await Booking.distinct(
    "service.category"
  );


  // Send categories to frontend
  res.json({
    success: true,

    data: {
      serviceCategories: categories
        .filter(Boolean)
        .sort()
    }
  });
}


// ========================================
// GET ONE BOOKING
// ========================================

export async function getBooking(req, res) {

  // Find booking using ID
  const booking = await Booking.findById(
    req.params.id
  )

    // Get customer information
    .populate("customer")

    // Get mechanic information
    .populate("mechanic");


  // Booking not found
  if (!booking) {

    return res.status(404).json({
      success: false,
      message: "Booking not found"
    });

  }


  // Send booking
  res.json({
    success: true,
    data: booking
  });
}


// ========================================
// UPDATE BOOKING STATUS
// ========================================

export async function updateStatus(req, res) {

  // Get status from frontend
  const { status } = req.body;


  // Allowed booking statuses
  const allowed = [
    "PENDING",
    "ASSIGNED",
    "MECHANIC_ON_THE_WAY",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED"
  ];


  // Check status
  if (!allowed.includes(status)) {

    return res.status(400).json({
      success: false,
      message: "Invalid status"
    });

  }


  // ========================================
  // UPDATE BOOKING
  // ========================================

  const booking = await Booking.findByIdAndUpdate(

    // Booking ID
    req.params.id,

    // Data to update
    {
      status: status
    },

    // Return updated document
    {
      new: true
    }

  )

    // Get customer
    .populate(
      "customer",
      "name email phone"
    )

    // Get mechanic
    .populate(
      "mechanic",
      "name status"
    );


  // Booking not found
  if (!booking) {

    return res.status(404).json({
      success: false,
      message: "Booking not found"
    });

  }


  // ========================================
  // UPDATE MECHANIC
  // ========================================

  if (booking.mechanic) {

    let mechanicStatus;


    // Booking completed or cancelled
    if (
      status === "COMPLETED" ||
      status === "CANCELLED"
    ) {

      mechanicStatus = "AVAILABLE";

    }

    // Mechanic is going to customer
    else if (
      status === "MECHANIC_ON_THE_WAY"
    ) {

      mechanicStatus = "ON_THE_WAY";

    }

    // All other statuses
    else {

      mechanicStatus = "BUSY";

    }


    // Update mechanic
    await Mechanic.findByIdAndUpdate(

      booking.mechanic._id,

      {
        status: mechanicStatus,

        // If completed/cancelled, mechanic has no booking
        currentBooking:
          status === "COMPLETED" ||
          status === "CANCELLED"
            ? null
            : booking._id
      }

    );
  }


  // ========================================
  // REAL-TIME UPDATE
  // ========================================

  req.app
    .get("io")
    ?.emit(
      "bookingUpdated",
      booking
    );


  // ========================================
  // SEND RESPONSE
  // ========================================

  res.json({
    success: true,
    data: booking
  });
}