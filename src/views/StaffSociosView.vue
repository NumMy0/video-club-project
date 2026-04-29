<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useOperationsStore } from "@/stores/operations";

const operationsStore = useOperationsStore();
const busqueda = ref("");
const filtroEstado = ref<"Todos" | "Activo" | "Deudor">("Todos");

type Socio = {
  dni?: string;
  nombre?: string;
  telefono?: string;
  email?: string | null;
  estado_cuenta?: "Activo" | "Deudor" | string;
};

onMounted(() => {
  operationsStore.loadSocios();
});

const sociosFiltrados = computed(() => {
  const texto = busqueda.value.trim().toLowerCase();

  return (operationsStore.socios as Socio[]).filter((socio) => {
    const coincideEstado =
      filtroEstado.value === "Todos" || socio.estado_cuenta === filtroEstado.value;

    const coincideBusqueda =
      !texto ||
      String(socio.dni ?? "").toLowerCase().includes(texto) ||
      String(socio.nombre ?? "").toLowerCase().includes(texto) ||
      String(socio.telefono ?? "").toLowerCase().includes(texto);

    return coincideEstado && coincideBusqueda;
  });
});

const totalSocios = computed(() => operationsStore.socios.length);
const totalActivos = computed(
  () => (operationsStore.socios as Socio[]).filter((socio) => socio.estado_cuenta === "Activo").length,
);
const totalDeudores = computed(
  () => (operationsStore.socios as Socio[]).filter((socio) => socio.estado_cuenta === "Deudor").length,
);

function badgeClass(estado?: string) {
  return estado === "Deudor" ? "badge badge--danger" : "badge badge--success";
}

async function recargarSocios() {
  await operationsStore.loadSocios();
}
</script>

<template>
  <section class="panel">
    <div class="panel__header">
      <div>
        <p class="panel__eyebrow">Staff</p>
        <h1>Socios</h1>
        <p class="panel__subtitle">Busca y filtra socios por estado, DNI, nombre o teléfono.</p>
      </div>

      <button class="refresh" :disabled="operationsStore.loading" @click="recargarSocios">
        {{ operationsStore.loading ? "Actualizando..." : "Actualizar" }}
      </button>
    </div>

    <div class="metrics">
      <article>
        <span>Total</span>
        <strong>{{ totalSocios }}</strong>
      </article>
      <article>
        <span>Activos</span>
        <strong>{{ totalActivos }}</strong>
      </article>
      <article>
        <span>Deudores</span>
        <strong>{{ totalDeudores }}</strong>
      </article>
    </div>

    <div class="filters">
      <label>
        <span class="sr-only">Buscar socio</span>
        <input v-model="busqueda" type="search" placeholder="Buscar por DNI, nombre o telefono" />
      </label>

      <div class="filters__chips" role="group" aria-label="Filtrar por estado">
        <button :class="{ 'chip--active': filtroEstado === 'Todos' }" class="chip" @click="filtroEstado = 'Todos'">
          Todos
        </button>
        <button :class="{ 'chip--active': filtroEstado === 'Activo' }" class="chip" @click="filtroEstado = 'Activo'">
          Activos
        </button>
        <button :class="{ 'chip--active': filtroEstado === 'Deudor' }" class="chip" @click="filtroEstado = 'Deudor'">
          Deudores
        </button>
      </div>
    </div>

    <p v-if="operationsStore.loading">Cargando socios...</p>
    <p v-else-if="operationsStore.error">{{ operationsStore.error }}</p>
    <p v-else-if="sociosFiltrados.length === 0" class="empty">No hay socios para los filtros actuales.</p>

    <table v-else>
      <thead>
        <tr>
          <th>DNI</th>
          <th>Nombre</th>
          <th>Telefono</th>
          <th>Email</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="socio in sociosFiltrados" :key="String(socio.dni)">
          <td>{{ socio.dni }}</td>
          <td>{{ socio.nombre }}</td>
          <td>{{ socio.telefono }}</td>
          <td>{{ socio.email || 'Sin email' }}</td>
          <td><span :class="badgeClass(socio.estado_cuenta)">{{ socio.estado_cuenta }}</span></td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
.panel {
  padding: 1.5rem 1rem;
}

.panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.panel__eyebrow {
  color: #0369a1;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.panel__subtitle {
  margin-top: 0.35rem;
  color: #64748b;
}

.refresh {
  border: 0;
  border-radius: 0.65rem;
  background: #0f172a;
  color: #fff;
  padding: 0.7rem 1rem;
  cursor: pointer;
}

.refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
  gap: 0.75rem;
  margin: 1rem 0;
}

.metrics article {
  border: 1px solid #e2e8f0;
  border-radius: 0.8rem;
  padding: 0.9rem 1rem;
  background: #fff;
}

.metrics span {
  display: block;
  color: #64748b;
  font-size: 0.85rem;
}

.metrics strong {
  display: block;
  margin-top: 0.25rem;
  font-size: 1.45rem;
  color: #0f172a;
}

.filters {
  display: grid;
  gap: 0.85rem;
  margin-bottom: 1rem;
}

.filters input {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 0.65rem;
  padding: 0.7rem 0.85rem;
}

.filters__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip {
  border: 1px solid #cbd5e1;
  border-radius: 9999px;
  background: #fff;
  color: #0f172a;
  padding: 0.45rem 0.9rem;
  cursor: pointer;
}

.chip--active {
  border-color: #0f172a;
  background: #0f172a;
  color: #fff;
}

.empty {
  margin-top: 1rem;
  color: #64748b;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  overflow: hidden;
}

th,
td {
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
  padding: 0.5rem;
}

thead th {
  background: #f8fafc;
  font-size: 0.85rem;
  color: #334155;
}

.badge {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  padding: 0.3rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
}

.badge--success {
  background: #dcfce7;
  color: #166534;
}

.badge--danger {
  background: #fee2e2;
  color: #b91c1c;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
