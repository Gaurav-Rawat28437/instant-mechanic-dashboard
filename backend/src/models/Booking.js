import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true, index: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  mechanic: { type: mongoose.Schema.Types.ObjectId, ref: "Mechanic", default: null },
  vehicle: {
    registrationNumber: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true }
  },
  service: {
    name: { type: String, required: true },
    category: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ["PENDING", "ASSIGNED", "MECHANIC_ON_THE_WAY", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
    default: "PENDING",
    index: true
  },
  amount: { type: Number, required: true },
  scheduledAt: { type: Date, required: true, index: true }
}, { timestamps: true });

bookingSchema.index({ "vehicle.registrationNumber": 1 });
bookingSchema.index({ amount: -1 });
bookingSchema.index({ createdAt: -1 });

export default mongoose.model("Booking", bookingSchema);
