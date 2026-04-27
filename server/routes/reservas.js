import { Router } from "express";
import auth from "../middlewares/auth.js";
import {
  crearReservaController,
  historialSocioController,
} from "../controllers/reservationController.js";

const router = Router();

router.post("/", auth(["Socio", "Admin", "Vendedor"]), crearReservaController);
router.get("/historial", auth(["Socio"]), historialSocioController);

export default router;
