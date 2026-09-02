import { Router } from "express";
import { getCustomers, getCustomer } from "../controllers/customerController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);
router.get("/", getCustomers);
router.get("/:id", getCustomer);
export default router;
