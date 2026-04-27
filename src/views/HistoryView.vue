<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useOperationsStore } from "@/stores/operations";

type HistorialItem = {
  id_alquiler?: number | string;
  titulo?: string;
  genero?: string;
  formato?: string;
  estado_copia?: string;
  fecha_salida?: string;
  fecha_limite?: string;
  fecha_retorno?: string | null;
  observaciones?: string;
  total_pagado?: number | string;
  saldo_pendiente?: number | string;
};

const operationsStore = useOperationsStore();
const authStore = useAuthStore();

const historial = computed(() => operationsStore.historial as HistorialItem[]);

const puedeVerHistorial = computed(() => authStore.sessionReady && authStore.isAuthenticated);

function formatearFecha(valor?: string | null) {
  if (!valor) {
    return "-";
  }

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return valor;
  }

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(fecha);
}

function formatearDinero(valor?: number | string) {
  const numero = Number(valor ?? 0);

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number.isNaN(numero) ? 0 : numero);
}

function obtenerEstado(item: HistorialItem) {
  if (item.fecha_retorno) {
    return {
      label: "Devuelto",
      className: "history__badge--returned",
    };
  }

  const fechaLimite = item.fecha_limite ? new Date(item.fecha_limite) : null;
  const vencido = fechaLimite ? fechaLimite.getTime() < Date.now() : false;

  return {
    label: vencido ? "Vencido" : "Activo",
    className: vencido ? "history__badge--late" : "history__badge--active",
  };
}

const resumen = computed(() => {
  const items = historial.value;
  const activos = items.filter((item) => !item.fecha_retorno).length;
  const vencidos = items.filter((item) => {
    if (item.fecha_retorno || !item.fecha_limite) {
      return false;
    }

    return new Date(item.fecha_limite).getTime() < Date.now();
  }).length;
  const deudaTotal = items.reduce((acc, item) => acc + Number(item.saldo_pendiente ?? 0), 0);

  return { activos, vencidos, deudaTotal };
});

async function recargarHistorial() {
  await operationsStore.loadHistorial();
}

onMounted(() => {
  if (puedeVerHistorial.value) {
    void recargarHistorial();
  }
});
</script>

<template>
  <section class="history">
    <header class="history__header">
      <div>
        <p class="history__eyebrow">Portal socio</p>
        <h1 class="history__title">Mi historial</h1>
        <p class="history__subtitle">
          Revisa tus alquileres, devoluciones y cualquier saldo pendiente desde una sola vista.
        </p>
      </div>

      <div v-if="authStore.user" class="history__profile">
        <span class="history__profileName">{{ authStore.user.nombre }}</span>
        <span class="history__profileRole">Socio</span>
      </div>
    </header>

    <div class="history__summary">
      <article class="history__metric">
        <span>Activos</span>
        <strong>{{ resumen.activos }}</strong>
      </article>
      <article class="history__metric">
        <span>Vencidos</span>
        <strong>{{ resumen.vencidos }}</strong>
      </article>
      <article class="history__metric">
        <span>Saldo pendiente</span>
        <strong>{{ formatearDinero(resumen.deudaTotal) }}</strong>
      </article>
    </div>

    <div class="history__toolbar">
      <p class="history__toolbarNote">
        {{
          authStore.sessionReady
            ? 'Tus movimientos se actualizan desde la base en tiempo real.'
            : 'Estamos verificando tu sesión para cargar tu historial.'
        }}
      </p>

      <button class="history__refresh" :disabled="operationsStore.loading" @click="recargarHistorial">
        {{ operationsStore.loading ? 'Actualizando...' : 'Actualizar historial' }}
      </button>
    </div>

    <div v-if="operationsStore.loading" class="history__state">Cargando historial...</div>

    <div v-else-if="!puedeVerHistorial" class="history__state history__state--empty">
      Necesitas iniciar sesión como socio para ver tu historial.
    </div>

    <div v-else-if="operationsStore.error" class="history__state history__state--error">
      {{ operationsStore.error }}
    </div>

    <div v-else-if="historial.length === 0" class="history__state history__state--empty">
      No hay alquileres registrados.
    </div>

    <div v-else class="history__list">
      <article v-for="item in historial" :key="String(item.id_alquiler)" class="history-card">
        <div class="history-card__top">
          <div>
            <p class="history-card__genre">{{ item.genero ?? 'Sin género' }}</p>
            <h2 class="history-card__title">{{ item.titulo ?? 'Pelicula sin titulo' }}</h2>
          </div>

          <span class="history-card__badge" :class="obtenerEstado(item).className">
            {{ obtenerEstado(item).label }}
          </span>
        </div>

        <dl class="history-card__grid">
          <div>
            <dt>Salida</dt>
            <dd>{{ formatearFecha(item.fecha_salida) }}</dd>
          </div>
          <div>
            <dt>Limite</dt>
            <dd>{{ formatearFecha(item.fecha_limite) }}</dd>
          </div>
          <div>
            <dt>Retorno</dt>
            <dd>{{ item.fecha_retorno ? formatearFecha(item.fecha_retorno) : 'Pendiente' }}</dd>
          </div>
          <div>
            <dt>Saldo pendiente</dt>
            <dd>{{ formatearDinero(item.saldo_pendiente) }}</dd>
          </div>
        </dl>

        <p v-if="item.observaciones" class="history-card__notes">
          {{ item.observaciones }}
        </p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.history {
  width: 100%;
  max-width: 80rem;
  margin: 0 auto;
  padding: 2.5rem 1rem;
}

.history__header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.history__eyebrow {
  color: #0369a1;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.25em;
  text-transform: uppercase;
}

.history__title {
  margin-top: 0.5rem;
  color: #0f172a;
  font-size: clamp(2rem, 5vw, 2.5rem);
  font-weight: 800;
  line-height: 1.1;
}

.history__subtitle {
  margin-top: 0.75rem;
  max-width: 42rem;
  color: #475569;
}

.history__profile {
  display: inline-flex;
  flex-direction: column;
  gap: 0.25rem;
  align-self: flex-start;
  border: 1px solid #cbd5e1;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.88);
  padding: 0.9rem 1rem;
}

.history__profileName {
  font-weight: 700;
  color: #0f172a;
}

.history__profileRole {
  color: #64748b;
  font-size: 0.85rem;
}

.history__summary {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.history__toolbar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.history__toolbarNote {
  color: #475569;
  font-size: 0.95rem;
}

.history__refresh {
  align-self: flex-start;
  border: 0;
  border-radius: 0.75rem;
  padding: 0.7rem 1rem;
  background: #0f172a;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.history__refresh:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.history__metric {
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.92);
  padding: 1rem;
  display: grid;
  gap: 0.35rem;
}

.history__metric span {
  color: #64748b;
  font-size: 0.85rem;
}

.history__metric strong {
  color: #0f172a;
  font-size: 1.15rem;
}

.history__state {
  border: 1px solid #cbd5e1;
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  color: #475569;
  padding: 1.5rem;
}

.history__state--error {
  border-color: #fecdd3;
  background: #fff1f2;
  color: #be123c;
}

.history__state--empty {
  border-style: dashed;
  text-align: center;
}

.history__list {
  display: grid;
  gap: 1rem;
}

.history-card {
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
  padding: 1.25rem;
}

.history-card__top {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.history-card__genre {
  color: #0369a1;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.history-card__title {
  margin-top: 0.35rem;
  color: #0f172a;
  font-size: 1.25rem;
  font-weight: 700;
}

.history-card__badge {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.35rem 0.75rem;
  white-space: nowrap;
}

.history__badge--active {
  background: #dbeafe;
  color: #1d4ed8;
}

.history__badge--late {
  background: #ffe4e6;
  color: #be123c;
}

.history__badge--returned {
  background: #dcfce7;
  color: #15803d;
}

.history-card__grid {
  display: grid;
  gap: 0.9rem;
  margin-top: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
}

.history-card__grid dt {
  color: #64748b;
  font-size: 0.8rem;
}

.history-card__grid dd {
  color: #0f172a;
  font-weight: 600;
  margin-top: 0.25rem;
}

.history-card__notes {
  margin-top: 1rem;
  color: #475569;
  font-size: 0.95rem;
}

@media (min-width: 640px) {
  .history {
    padding-inline: 1.5rem;
  }

  .history__summary {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .history__header {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }

  .history__toolbar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
