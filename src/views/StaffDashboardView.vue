<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useOperationsStore } from "@/stores/operations";

type Resumen = {
  alquileres_activos?: number;
  alquileres_vencidos?: number;
  copias_disponibles?: number;
  copias_reservadas?: number;
  copias_alquiladas?: number;
};

type CriticalItem = {
  id_pelicula?: number | string;
  titulo?: string;
  copias_disponibles?: number;
  alquileres_ultimo_mes?: number;
};

const operationsStore = useOperationsStore();

const resumen = computed(() => (operationsStore.resumen as Resumen) ?? {});

const metricas = computed(() => [
  {
    id: "activos",
    label: "Alquileres activos",
    value: resumen.value.alquileres_activos ?? 0,
    tone: "neutral",
  },
  {
    id: "vencidos",
    label: "Alquileres vencidos",
    value: resumen.value.alquileres_vencidos ?? 0,
    tone: (resumen.value.alquileres_vencidos ?? 0) > 0 ? "danger" : "success",
  },
  {
    id: "disponibles",
    label: "Copias disponibles",
    value: resumen.value.copias_disponibles ?? 0,
    tone: "success",
  },
  {
    id: "reservadas",
    label: "Copias reservadas",
    value: resumen.value.copias_reservadas ?? 0,
    tone: "warning",
  },
  {
    id: "alquiladas",
    label: "Copias alquiladas",
    value: resumen.value.copias_alquiladas ?? 0,
    tone: "neutral",
  },
]);

const alertas = computed(() => {
  const lista: Array<{ id: string; level: "danger" | "warning" | "success"; text: string }> = [];

  if ((resumen.value.alquileres_vencidos ?? 0) > 0) {
    lista.push({
      id: "vencidos",
      level: "danger",
      text: `Hay ${resumen.value.alquileres_vencidos} alquileres vencidos que requieren seguimiento.`,
    });
  }

  if ((operationsStore.criticalInventory?.length ?? 0) > 0) {
    lista.push({
      id: "critico",
      level: "warning",
      text: `Se detectaron ${operationsStore.criticalInventory.length} titulos con inventario critico.`,
    });
  }

  if (lista.length === 0) {
    lista.push({
      id: "ok",
      level: "success",
      text: "Operacion estable: no hay alertas criticas en este momento.",
    });
  }

  return lista;
});

const inventarioCritico = computed(() => operationsStore.criticalInventory as CriticalItem[]);

async function recargarPanel() {
  await operationsStore.loadResumenStaff();
}

onMounted(() => {
  void recargarPanel();
});
</script>

<template>
  <section class="panel">
    <header class="panel__header">
      <div>
        <p class="panel__eyebrow">Staff</p>
        <h1>Dashboard operativo</h1>
        <p class="panel__subtitle">
          Monitorea alquileres, estado de copias e inventario critico en una sola vista.
        </p>
      </div>

      <button class="panel__refresh" :disabled="operationsStore.loading" @click="recargarPanel">
        {{ operationsStore.loading ? "Actualizando..." : "Actualizar" }}
      </button>
    </header>

    <p v-if="operationsStore.loading" class="panel__state">Cargando panel...</p>
    <p v-else-if="operationsStore.error" class="panel__state panel__state--error">{{ operationsStore.error }}</p>

    <template v-else>
      <section class="alerts" aria-label="Alertas operativas">
        <article
          v-for="alerta in alertas"
          :key="alerta.id"
          class="alert"
          :class="`alert--${alerta.level}`"
        >
          {{ alerta.text }}
        </article>
      </section>

      <section class="metrics" aria-label="Resumen de metricas">
        <article
          v-for="item in metricas"
          :key="item.id"
          class="metric-card"
          :class="`metric-card--${item.tone}`"
        >
          <p class="metric-card__label">{{ item.label }}</p>
          <strong class="metric-card__value">{{ item.value }}</strong>
        </article>
      </section>

      <section class="critical" aria-label="Inventario critico">
        <div class="critical__header">
          <h2>Inventario critico</h2>
          <span class="critical__count">{{ inventarioCritico.length }} titulos</span>
        </div>

        <p v-if="inventarioCritico.length === 0" class="panel__state panel__state--empty">
          Sin peliculas criticas actualmente.
        </p>

        <div v-else class="critical__grid">
          <article
            v-for="item in inventarioCritico"
            :key="String(item.id_pelicula)"
            class="critical-card"
          >
            <h3 class="critical-card__title">{{ item.titulo ?? "Titulo sin nombre" }}</h3>
            <p class="critical-card__meta">
              Disponibles: <strong>{{ item.copias_disponibles ?? 0 }}</strong>
            </p>
            <p class="critical-card__meta">
              Alquileres ultimo mes: <strong>{{ item.alquileres_ultimo_mes ?? 0 }}</strong>
            </p>
          </article>
        </div>
      </section>
    </template>
  </section>
</template>

<style scoped>
.panel {
  width: 100%;
  max-width: 80rem;
  margin: 0 auto;
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
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.panel__subtitle {
  margin-top: 0.5rem;
  color: #64748b;
}

.panel__refresh {
  border: 0;
  border-radius: 0.7rem;
  background: #0f172a;
  color: #fff;
  padding: 0.7rem 1rem;
  font-weight: 700;
  cursor: pointer;
}

.panel__refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.panel__state {
  margin-top: 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.9rem;
  background: #fff;
  color: #475569;
  padding: 1rem;
}

.panel__state--error {
  border-color: #fecdd3;
  background: #fff1f2;
  color: #be123c;
}

.panel__state--empty {
  margin-top: 0.75rem;
}

.alerts {
  display: grid;
  gap: 0.65rem;
  margin-top: 1rem;
}

.alert {
  border-radius: 0.8rem;
  padding: 0.85rem 1rem;
  font-weight: 600;
}

.alert--danger {
  background: #fee2e2;
  color: #991b1b;
}

.alert--warning {
  background: #fef3c7;
  color: #92400e;
}

.alert--success {
  background: #dcfce7;
  color: #166534;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  gap: 0.85rem;
  margin-top: 1rem;
}

.metric-card {
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  background: #fff;
  padding: 1rem;
}

.metric-card__label {
  color: #64748b;
  font-size: 0.85rem;
}

.metric-card__value {
  display: block;
  margin-top: 0.4rem;
  color: #0f172a;
  font-size: 1.7rem;
  line-height: 1;
}

.metric-card--danger {
  border-color: #fecaca;
}

.metric-card--warning {
  border-color: #fde68a;
}

.metric-card--success {
  border-color: #bbf7d0;
}

.critical {
  margin-top: 1.25rem;
}

.critical__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.critical__count {
  border-radius: 9999px;
  background: #f1f5f9;
  color: #334155;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.3rem 0.7rem;
}

.critical__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.critical-card {
  border: 1px solid #e2e8f0;
  border-radius: 0.9rem;
  background: #fff;
  padding: 0.9rem;
}

.critical-card__title {
  color: #0f172a;
  font-size: 1rem;
}

.critical-card__meta {
  margin-top: 0.4rem;
  color: #475569;
}

@media (min-width: 640px) {
  .panel {
    padding-inline: 1.5rem;
  }
}
</style>
