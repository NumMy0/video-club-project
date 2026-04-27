<script setup lang="ts">
import { onMounted } from "vue";
import { useOperationsStore } from "@/stores/operations";

const operationsStore = useOperationsStore();

onMounted(() => {
  operationsStore.loadResumenStaff();
});
</script>

<template>
  <section class="panel">
    <h1>Panel staff</h1>

    <p v-if="operationsStore.loading">Cargando panel...</p>
    <p v-else-if="operationsStore.error">{{ operationsStore.error }}</p>

    <div v-else class="metrics">
      <article>
        <h2>Alquileres activos</h2>
        <p>{{ operationsStore.resumen.alquileres_activos ?? 0 }}</p>
      </article>
      <article>
        <h2>Alquileres vencidos</h2>
        <p>{{ operationsStore.resumen.alquileres_vencidos ?? 0 }}</p>
      </article>
      <article>
        <h2>Copias disponibles</h2>
        <p>{{ operationsStore.resumen.copias_disponibles ?? 0 }}</p>
      </article>
    </div>

    <h2>Inventario critico</h2>
    <p v-if="operationsStore.criticalInventory.length === 0">Sin peliculas criticas actualmente.</p>
    <ul v-else>
      <li v-for="item in operationsStore.criticalInventory" :key="String(item.id_pelicula)">
        {{ item.titulo }} - disponibles: {{ item.copias_disponibles }} / alquileres ultimo mes: {{ item.alquileres_ultimo_mes }}
      </li>
    </ul>
  </section>
</template>

<style scoped>
.panel {
  padding: 1.5rem 1rem;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.metrics article {
  border: 1px solid #e2e8f0;
  border-radius: 0.8rem;
  padding: 1rem;
  background: #fff;
}
</style>
