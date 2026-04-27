import { Router } from "express";
import auth from "../middlewares/auth.js";
import {
  loginController,
  meController,
} from "../controllers/authController.js";

const router = Router();

router.post("/login", loginController);
router.get("/me", auth(), meController);

export default router;
