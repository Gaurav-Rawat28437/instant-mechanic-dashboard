import mongoose from "mongoose";

const mechanicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  specialization: { type: String, required: true },
  status: {
    type: String,
    enum: ["AVAILABLE", "BUSY", "OFFLINE", "ON_THE_WAY"],
    default: "AVAILABLE"
  },
  jobsCompleted: { type: Number, default: 0 },
  currentBooking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
  location: {
    lat: Number,
    lng: Number
  }
}, { timestamps: true });

export default mongoose.model("Mechanic", mechanicSchema);
