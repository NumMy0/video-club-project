<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const router = useRouter();

const isStaff = computed(
  () => authStore.role === "Admin" || authStore.role === "Vendedor",
);

const sessionText = computed(() => {
  if (!authStore.isAuthenticated) {
    return "Sesión no iniciada";
  }

  if (!authStore.sessionReady) {
    return "Verificando sesión...";
  }

  if (!authStore.user) {
    return "Sesión iniciada";
  }

  return `${authStore.user.nombre} (${authStore.user.rol})`;
});

async function logout() {
  authStore.logout();
  await router.push("/login");
}

onMounted(() => {
  if (!authStore.user && authStore.token) {
    void authStore.hydrateSession();
  }
});
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="app-header__brand">Cinemateca</div>

      <nav class="app-header__nav">
        <RouterLink to="/catalogo">Catalogo</RouterLink>
        <RouterLink v-if="authStore.sessionReady && authStore.role === 'Socio'" to="/historial">Mi historial</RouterLink>
        <RouterLink v-if="authStore.sessionReady && isStaff" to="/staff">Panel</RouterLink>
        <RouterLink v-if="authStore.sessionReady && isStaff" to="/staff/socios">Socios</RouterLink>
        <RouterLink v-if="authStore.sessionReady && isStaff" to="/staff/devoluciones">Devoluciones</RouterLink>
      </nav>

      <div class="app-header__session">
        <span>{{ sessionText }}</span>
        <RouterLink v-if="!authStore.isAuthenticated" to="/login">Login</RouterLink>
        <button v-else @click="logout">Salir</button>
      </div>
    </header>

    <div v-if="authStore.isAuthenticated && !authStore.sessionReady" class="app-shell__status">
      Estamos verificando tu sesión para cargar tus opciones.
    </div>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.app-shell__status {
  border-bottom: 1px solid #e2e8f0;
  background: #eff6ff;
  color: #1d4ed8;
  padding: 0.65rem 1rem;
  font-size: 0.9rem;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(6px);
  padding: 0.75rem 1rem;
}

.app-header__brand {
  font-weight: 800;
}

.app-header__nav {
  display: flex;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.app-header__session {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

button {
  border: 0;
  background: #0f172a;
  color: #fff;
  border-radius: 0.55rem;
  padding: 0.45rem 0.75rem;
  cursor: pointer;
}
</style>

