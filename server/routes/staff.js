import { Router } from "express";
import auth from "../middlewares/auth.js";
import {
  devolucionController,
  listarSociosController,
  resumenOperativoController,
} from "../controllers/staffController.js";

const router = Router();

router.use(auth(["Admin", "Vendedor"]));

router.get("/socios", listarSociosController);
router.get("/resumen", resumenOperativoController);
router.post("/alquileres/:idAlquiler/devolucion", devolucionController);

export default router;
