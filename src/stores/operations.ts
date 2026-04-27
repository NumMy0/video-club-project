import { defineStore } from "pinia";
import { ref } from "vue";
import { reservationApi, staffApi } from "@/api/services";

export const useOperationsStore = defineStore("operations", () => {
  const historial = ref<Array<Record<string, unknown>>>([]);
  const socios = ref<Array<Record<string, unknown>>>([]);
  const criticalInventory = ref<Array<Record<string, unknown>>>([]);
  const resumen = ref<Record<string, number>>({});
  const reservationMessage = ref("");
  const loading = ref(false);
  const error = ref("");

  async function loadHistorial() {
    loading.value = true;
    error.value = "";

    try {
      const { data } = await reservationApi.history();
      historial.value = Array.isArray(data?.data) ? data.data : [];
    } catch (_error) {
      error.value = "No se pudo cargar el historial";
      historial.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function crearReserva(idPelicula: number) {
    loading.value = true;
    error.value = "";
    reservationMessage.value = "";

    console.log("[operations] crearReserva inicio", { idPelicula });

    try {
      const { data } = await reservationApi.create({ id_pelicula: idPelicula });
      console.log("[operations] crearReserva respuesta", data);
      reservationMessage.value = data?.message ?? "Reserva creada correctamente";
      return data;
    } catch (_error) {
      console.error("[operations] crearReserva fallo", _error);
      error.value = "No se pudo crear la reserva";
      throw _error;
    } finally {
      loading.value = false;
    }
  }

  function clearReservationMessage() {
    reservationMessage.value = "";
  }

  async function loadSocios() {
    loading.value = true;
    error.value = "";

    try {
      const { data } = await staffApi.socios();
      socios.value = Array.isArray(data?.data) ? data.data : [];
    } catch (_error) {
      error.value = "No se pudieron cargar los socios";
      socios.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function loadResumenStaff() {
    loading.value = true;
    error.value = "";

    try {
      const [resumenResp, criticalResp] = await Promise.all([
        staffApi.resumen(),
        staffApi.criticalInventory(),
      ]);
      resumen.value = resumenResp.data?.data ?? {};
      criticalInventory.value = Array.isArray(criticalResp.data?.data)
        ? criticalResp.data.data
        : [];
    } catch (_error) {
      error.value = "No se pudo cargar el panel staff";
      resumen.value = {};
      criticalInventory.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function registrarDevolucion(idAlquiler: number) {
    loading.value = true;
    error.value = "";

    try {
      await staffApi.devolucion(idAlquiler);
    } catch (_error) {
      error.value = "No se pudo registrar la devolucion";
      throw _error;
    } finally {
      loading.value = false;
    }
  }

  return {
    historial,
    socios,
    criticalInventory,
    resumen,
    loading,
    error,
    reservationMessage,
    loadHistorial,
    crearReserva,
    clearReservationMessage,
    loadSocios,
    loadResumenStaff,
    registrarDevolucion,
  };
});
