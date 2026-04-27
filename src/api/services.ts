import api from "@/api/axios.js";

export const authApi = {
  login(payload: { identifier: string; password: string; role: "Admin" | "Vendedor" | "Socio" }) {
    return api.post("/auth/login", payload);
  },
  me() {
    return api.get("/auth/me");
  },
};

export const catalogApi = {
  list() {
    return api.get("/peliculas");
  },
};

export const reservationApi = {
  create(payload: { id_copia?: number; id_pelicula?: number; fecha_limite?: string; observaciones?: string }) {
    return api.post("/reservas", payload);
  },
  history() {
    return api.get("/reservas/historial");
  },
};

export const staffApi = {
  resumen() {
    return api.get("/staff/resumen");
  },
  socios() {
    return api.get("/staff/socios");
  },
  devolucion(idAlquiler: number) {
    return api.post(`/staff/alquileres/${idAlquiler}/devolucion`);
  },
  criticalInventory() {
    return api.get("/reports/critical-inventory");
  },
};
