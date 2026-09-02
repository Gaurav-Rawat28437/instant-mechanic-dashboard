import { Router } from "express";
import { getMechanics, getMechanic, updateMechanicStatus } from "../controllers/mechanicController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);
router.get("/", getMechanics);
router.get("/:id", getMechanic);
router.patch("/:id/status", updateMechanicStatus);
export default router;
