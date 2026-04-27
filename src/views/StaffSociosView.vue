<script setup lang="ts">
import { onMounted } from "vue";
import { useOperationsStore } from "@/stores/operations";

const operationsStore = useOperationsStore();

onMounted(() => {
  operationsStore.loadSocios();
});
</script>

<template>
  <section class="panel">
    <h1>Socios</h1>

    <p v-if="operationsStore.loading">Cargando socios...</p>
    <p v-else-if="operationsStore.error">{{ operationsStore.error }}</p>

    <table v-else>
      <thead>
        <tr>
          <th>DNI</th>
          <th>Nombre</th>
          <th>Telefono</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="socio in operationsStore.socios" :key="String(socio.dni)">
          <td>{{ socio.dni }}</td>
          <td>{{ socio.nombre }}</td>
          <td>{{ socio.telefono }}</td>
          <td>{{ socio.estado_cuenta }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
.panel {
  padding: 1.5rem 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th,
td {
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
  padding: 0.5rem;
}
</style>
