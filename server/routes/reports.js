import { Router } from "express";
import { criticalInventoryReport } from "../controllers/reportController.js";

const router = Router();

router.get("/critical-inventory", criticalInventoryReport);

export default router;
