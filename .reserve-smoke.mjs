import app from "./server/app.js";

const PORT = 3103;
const server = app.listen(PORT, async () => {
  try {
    const loginRes = await fetch(`http://127.0.0.1:${PORT}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "30111222", password: "30111222", role: "Socio" }),
    });
    const login = await loginRes.json();

    const reservaRes = await fetch(`http://127.0.0.1:${PORT}/api/reservas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${login.token}`,
      },
      body: JSON.stringify({ id_pelicula: 4 }),
    });
    const reserva = await reservaRes.json();

    const historialRes = await fetch(`http://127.0.0.1:${PORT}/api/reservas/historial`, {
      headers: { Authorization: `Bearer ${login.token}` },
    });
    const historial = await historialRes.json();

    console.log(JSON.stringify({
      loginStatus: loginRes.status,
      reservaStatus: reservaRes.status,
      reservaData: reserva.data,
      historialCount: Array.isArray(historial.data) ? historial.data.length : -1,
    }));
  } finally {
    server.close();
  }
});
