import app from "./server/app.js";

const PORT = 3104;
const server = app.listen(PORT, async () => {
  try {
    const loginRes = await fetch(`http://127.0.0.1:${PORT}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "30111222", password: "30111222", role: "Socio" }),
    });
    const login = await loginRes.json();

    const catalogRes = await fetch(`http://127.0.0.1:${PORT}/api/peliculas`, {
      headers: { Authorization: `Bearer ${login.token}` },
    });
    const catalog = await catalogRes.json();

    const reserveRes = await fetch(`http://127.0.0.1:${PORT}/api/reservas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${login.token}`,
      },
      body: JSON.stringify({ id_pelicula: 5 }),
    });
    const reserve = await reserveRes.json();

    console.log(JSON.stringify({
      loginStatus: loginRes.status,
      catalogCount: Array.isArray(catalog.data) ? catalog.data.length : -1,
      reserveStatus: reserveRes.status,
      reserveCopy: reserve.data?.id_copia,
      reserveMovie: reserve.data?.id_pelicula,
    }));
  } finally {
    server.close();
  }
});
