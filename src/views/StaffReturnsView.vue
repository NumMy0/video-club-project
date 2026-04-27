<script setup lang="ts">
import { ref } from "vue";
import { useOperationsStore } from "@/stores/operations";

const operationsStore = useOperationsStore();
const idAlquiler = ref("");
const message = ref("");

async function registrarDevolucion() {
  message.value = "";

  const id = Number(idAlquiler.value);

  if (!id) {
    message.value = "Ingresa un id de alquiler valido";
    return;
  }

  try {
    await operationsStore.registrarDevolucion(id);
    message.value = "Devolucion registrada correctamente";
    idAlquiler.value = "";
  } catch (_error) {
    message.value = operationsStore.error || "No se pudo registrar";
  }
}
</script>

<template>
  <section class="panel">
    <h1>Registrar devolucion</h1>

    <div class="form-row">
      <input v-model="idAlquiler" placeholder="ID de alquiler" />
      <button :disabled="operationsStore.loading" @click="registrarDevolucion">
        {{ operationsStore.loading ? "Procesando..." : "Registrar" }}
      </button>
    </div>

    <p v-if="message">{{ message }}</p>
  </section>
</template>

<style scoped>
.panel {
  padding: 1.5rem 1rem;
}

.form-row {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
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
