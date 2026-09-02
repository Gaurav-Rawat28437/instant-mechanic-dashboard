import { Router } from "express";
import { getBookings, getBooking, updateStatus } from "../controllers/bookingController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);
router.get("/", getBookings);
router.get("/:id", getBooking);
router.patch("/:id/status", updateStatus);
export default router;
