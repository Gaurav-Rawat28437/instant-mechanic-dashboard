import Mechanic from "../models/Mechanic.js";

export async function getMechanics(req, res) {
  const mechanics = await Mechanic.find().populate("currentBooking", "bookingId status vehicle");
  res.json({ success: true, data: mechanics });
}

export async function getMechanic(req, res) {
  const mechanic = await Mechanic.findById(req.params.id).populate("currentBooking");
  if (!mechanic) return res.status(404).json({ success: false, message: "Mechanic not found" });
  res.json({ success: true, data: mechanic });
}

export async function updateMechanicStatus(req, res) {
  const allowed = ["AVAILABLE", "BUSY", "OFFLINE", "ON_THE_WAY"];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ success: false, message: "Invalid status" });
  const mechanic = await Mechanic.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).populate("currentBooking");
  if (!mechanic) return res.status(404).json({ success: false, message: "Mechanic not found" });
  req.app.get("io")?.emit("mechanicUpdated", mechanic);
  res.json({ success: true, data: mechanic });
}
