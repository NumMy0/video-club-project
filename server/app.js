import express from "express";
import cors from "cors";
import reportsRouter from "./routes/reports.js";
import peliculasRouter from "./routes/peliculas.js";
import authRouter from "./routes/auth.js";
import reservasRouter from "./routes/reservas.js";
import staffRouter from "./routes/staff.js";
import { testDbConnection } from "./db.js";

const app = express();

testDbConnection().catch((error) => {
  console.error("Failed to connect to MariaDB:", error);
});

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "cinemateca-api" });
});

app.use("/api/auth", authRouter);
app.use("/api/peliculas", peliculasRouter);
app.use("/api/reservas", reservasRouter);
app.use("/api/staff", staffRouter);
app.use("/api/reports", reportsRouter);

export default app;
