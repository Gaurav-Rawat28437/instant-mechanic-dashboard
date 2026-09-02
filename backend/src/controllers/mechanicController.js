import Mechanic from "../models/Mechanic.js";


// Get all mechanics
export async function getMechanics(req, res) {

  const mechanics = await Mechanic.find()
    .populate(
      "currentBooking",
      "bookingId status vehicle"
    );

  res.json({
    success: true,
    data: mechanics
  });
}


// Get one mechanic
export async function getMechanic(req, res) {

  const mechanic = await Mechanic.findById(
    req.params.id
  ).populate("currentBooking");

  if (!mechanic) {
    return res.status(404).json({
      success: false,
      message: "Mechanic not found"
    });
  }

  res.json({
    success: true,
    data: mechanic
  });
}


// Update mechanic status
export async function updateMechanicStatus(req, res) {

  const allowed = [
    "AVAILABLE",
    "BUSY",
    "OFFLINE",
    "ON_THE_WAY"
  ];

  // Check if status is valid
  if (!allowed.includes(req.body.status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status"
    });
  }

  // Update mechanic
  const mechanic = await Mechanic.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status
    },
    {
      new: true
    }
  ).populate("currentBooking");

  // Mechanic not found
  if (!mechanic) {
    return res.status(404).json({
      success: false,
      message: "Mechanic not found"
    });
  }

  // Send real-time update using Socket.io
  req.app
    .get("io")
    ?.emit("mechanicUpdated", mechanic);

  // Send response
  res.json({
    success: true,
    data: mechanic
  });
}