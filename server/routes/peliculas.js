import { Router } from "express";
import { getPeliculas } from "../controllers/peliculaController.js";

const router = Router();

router.get("/", getPeliculas);

export default router;
