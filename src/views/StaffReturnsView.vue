<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useOperationsStore } from "@/stores/operations";

const operationsStore = useOperationsStore();
const idAlquiler = ref("");
const message = ref("");
const confirmando = ref(false);
const registrandoId = ref<number | null>(null);
const filtro = ref("");

type AlquilerDetalle = {
  id_alquiler?: number | string;
  dni_socio?: string;
  fecha_salida?: string;
  fecha_limite?: string;
  fecha_retorno?: string | null;
  observaciones?: string | null;
  diasRetraso?: number;
  multa?: number;
  socio?: {
    dni?: string;
    nombre?: string;
    estado_cuenta?: string;
  } | null;
  copia?: {
    id_copia?: number | string;
    formato?: string;
    estado_copia?: string;
    pelicula?: {
      id_pelicula?: number | string;
      titulo?: string;
      genero?: string;
    } | null;
  } | null;
};

type AlquilerPendiente = {
  id_alquiler?: number | string;
  dni_socio?: string;
  socio_nombre?: string;
  pelicula_titulo?: string;
  id_copia?: number | string;
  formato?: string;
  fecha_salida?: string;
  fecha_limite?: string;
  diasRetraso?: number;
  multa?: number;
};

const detalle = ref<AlquilerDetalle | null>(null);

const alquileresPendientes = computed(
  () => operationsStore.alquileresPendientes as AlquilerPendiente[],
);

const alquileresFiltrados = computed(() => {
  const texto = filtro.value.trim().toLowerCase();

  if (!texto) {
    return alquileresPendientes.value;
  }

  return alquileresPendientes.value.filter((item) => {
    return (
      String(item.id_alquiler ?? "").toLowerCase().includes(texto) ||
      String(item.dni_socio ?? "").toLowerCase().includes(texto) ||
      String(item.socio_nombre ?? "").toLowerCase().includes(texto) ||
      String(item.pelicula_titulo ?? "").toLowerCase().includes(texto)
    );
  });
});

function formatearFecha(valor?: string) {
  if (!valor) {
    return "-";
  }

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return valor;
  }

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(fecha);
}

function formatearDinero(valor?: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(valor ?? 0));
}

async function recargarPendientes() {
  try {
    await operationsStore.loadAlquileresPendientes();
  } catch (_error) {
    message.value = operationsStore.error;
  }
}

function limpiarBusqueda() {
  idAlquiler.value = "";
  detalle.value = null;
  message.value = "";
  operationsStore.clearAlquilerDetalle();
}

async function buscarAlquiler() {
  message.value = "";
  detalle.value = null;
  operationsStore.clearAlquilerDetalle();

  const id = Number(idAlquiler.value);

  if (!id) {
    message.value = "Ingresa un id de alquiler valido";
    return;
  }

  try {
    const data = await operationsStore.loadAlquilerDetalle(id);
    detalle.value = data as AlquilerDetalle;
    message.value = "Alquiler cargado. Revisa los datos antes de confirmar.";
  } catch (_error) {
    message.value = operationsStore.error || "No se pudo cargar el alquiler";
  }
}

async function registrarDevolucion() {
  if (!detalle.value?.id_alquiler) {
    message.value = "Primero busca un alquiler valido";
    return;
  }

  confirmando.value = true;
  message.value = "";

  try {
    await operationsStore.registrarDevolucion(Number(detalle.value.id_alquiler));
    message.value = "Devolucion registrada correctamente";
    limpiarBusqueda();
  } catch (_error) {
    message.value = operationsStore.error || "No se pudo registrar";
  } finally {
    confirmando.value = false;
  }
}

async function registrarDesdeLista(item: AlquilerPendiente) {
  const id = Number(item.id_alquiler);

  if (!id) {
    return;
  }

  const confirma = window.confirm(
    `Registrar devolucion del alquiler #${id} (${item.pelicula_titulo ?? "Sin titulo"})?`,
  );

  if (!confirma) {
    return;
  }

  registrandoId.value = id;
  message.value = "";

  try {
    await operationsStore.registrarDevolucion(id);
    message.value = `Devolucion #${id} registrada correctamente.`;

    if (detalle.value?.id_alquiler && Number(detalle.value.id_alquiler) === id) {
      limpiarBusqueda();
    }
  } catch (_error) {
    message.value = operationsStore.error || "No se pudo registrar";
  } finally {
    registrandoId.value = null;
  }
}

onMounted(() => {
  void recargarPendientes();
});
</script>

<template>
  <section class="panel">
    <h1>Registrar devolucion</h1>

    <div class="list-header">
      <h2>Alquileres pendientes</h2>
      <button :disabled="operationsStore.loading" @click="recargarPendientes">
        {{ operationsStore.loading ? "Actualizando..." : "Actualizar lista" }}
      </button>
    </div>

    <input
      v-model="filtro"
      class="search"
      placeholder="Filtrar por ID, DNI, socio o pelicula"
      type="search"
    />

    <div v-if="alquileresFiltrados.length === 0" class="empty-list">
      No hay alquileres pendientes para mostrar.
    </div>

    <div v-else class="list-wrap">
      <table class="rentals-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Socio</th>
            <th>Pelicula</th>
            <th>Limite</th>
            <th>Retraso</th>
            <th>Multa</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in alquileresFiltrados" :key="String(item.id_alquiler)">
            <td>#{{ item.id_alquiler }}</td>
            <td>
              <strong>{{ item.socio_nombre }}</strong>
              <small>{{ item.dni_socio }}</small>
            </td>
            <td>
              <strong>{{ item.pelicula_titulo }}</strong>
              <small>Copia {{ item.id_copia }} - {{ item.formato }}</small>
            </td>
            <td>{{ formatearFecha(item.fecha_limite) }}</td>
            <td>{{ item.diasRetraso ?? 0 }} dias</td>
            <td>{{ formatearDinero(item.multa) }}</td>
            <td>
              <button
                :disabled="registrandoId === Number(item.id_alquiler) || operationsStore.loading"
                @click="registrarDesdeLista(item)"
              >
                {{ registrandoId === Number(item.id_alquiler) ? "Registrando..." : "Registrar" }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="form-row">
      <input v-model="idAlquiler" placeholder="ID de alquiler" />
      <button :disabled="operationsStore.loading" @click="buscarAlquiler">
        {{ operationsStore.loading ? "Buscando..." : "Buscar" }}
      </button>
    </div>

    <p v-if="message">{{ message }}</p>

    <div v-if="detalle" class="preview">
      <h2>Vista previa</h2>
      <dl>
        <div>
          <dt>Alquiler</dt>
          <dd>{{ detalle.id_alquiler }}</dd>
        </div>
        <div>
          <dt>Socio</dt>
          <dd>{{ detalle.socio?.nombre ?? detalle.dni_socio }}</dd>
        </div>
        <div>
          <dt>Película</dt>
          <dd>{{ detalle.copia?.pelicula?.titulo ?? 'Sin titulo' }}</dd>
        </div>
        <div>
          <dt>Fecha limite</dt>
          <dd>{{ detalle.fecha_limite }}</dd>
        </div>
        <div>
          <dt>Días de retraso</dt>
          <dd>{{ detalle.diasRetraso ?? 0 }}</dd>
        </div>
        <div>
          <dt>Multa estimada</dt>
          <dd>{{ detalle.multa ?? 0 }}</dd>
        </div>
      </dl>

      <div class="actions">
        <button
          :disabled="confirmando || operationsStore.loading || Boolean(detalle.fecha_retorno)"
          @click="registrarDevolucion"
        >
          {{ confirmando ? "Confirmando..." : "Confirmar devolucion" }}
        </button>
        <button class="secondary" :disabled="operationsStore.loading" @click="limpiarBusqueda">
          Limpiar
        </button>
      </div>

      <p v-if="detalle.fecha_retorno" class="preview__warning">
        Este alquiler ya fue devuelto.
      </p>
    </div>
  </section>
</template>

<style scoped>
.panel {
  padding: 1.5rem 1rem;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 1rem;
}

.search {
  width: 100%;
  margin-top: 0.75rem;
}

.list-wrap {
  margin-top: 0.75rem;
  overflow-x: auto;
}

.rentals-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  overflow: hidden;
  background: #fff;
}

.rentals-table th,
.rentals-table td {
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
  padding: 0.6rem;
  white-space: nowrap;
}

.rentals-table th {
  background: #f8fafc;
  color: #334155;
  font-size: 0.8rem;
}

.rentals-table td strong {
  display: block;
}

.rentals-table td small {
  color: #64748b;
}

.empty-list {
  margin-top: 0.75rem;
  color: #64748b;
}

.form-row {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.preview {
  margin-top: 1.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.75rem;
  padding: 1rem;
  background: #fff;
}

.preview dl {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 0.75rem 1rem;
  margin-top: 0.75rem;
}

.preview dt {
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
}

.preview dd {
  margin: 0.25rem 0 0;
  color: #0f172a;
}

.preview__warning {
  margin-top: 0.75rem;
  color: #b91c1c;
  font-weight: 700;
}

.actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.secondary {
  background: #e2e8f0;
  color: #0f172a;
}

input {
  border: 1px solid #cbd5e1;
  border-radius: 0.6rem;
  padding: 0.65rem 0.75rem;
}

button {
  border: 0;
  background: #0f172a;
  color: #fff;
  border-radius: 0.6rem;
  padding: 0.65rem 1rem;
  cursor: pointer;
}
</style>
