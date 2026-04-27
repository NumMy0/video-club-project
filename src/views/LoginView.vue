<script setup lang="ts">
import { computed, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const form = reactive({
  identifier: "",
  password: "",
  role: "Socio" as "Admin" | "Vendedor" | "Socio",
});

const hint = computed(() => {
  if (form.role === "Admin") {
    return "Demo: admin_ana / admin123";
  }

  if (form.role === "Vendedor") {
    return "Demo: vendedor_diego / vendedor123";
  }

  return "Socio: usa DNI como usuario y clave";
});

async function submit() {
  try {
    await authStore.login({
      identifier: form.identifier,
      password: form.password,
      role: form.role,
    });

    const redirect = typeof route.query.redirect === "string"
      ? route.query.redirect
      : "/catalogo";

    await router.push(redirect);
  } catch (_error) {
    // El error se muestra via authStore.error.
  }
}
</script>

<template>
  <section class="auth">
    <form class="auth__card" @submit.prevent="submit">
      <h1>Iniciar sesion</h1>
      <p class="auth__hint">{{ hint }}</p>

      <label>
        Rol
        <select v-model="form.role">
          <option value="Socio">Socio</option>
          <option value="Vendedor">Vendedor</option>
          <option value="Admin">Admin</option>
        </select>
      </label>

      <label>
        Usuario / DNI
        <input v-model="form.identifier" required />
      </label>

      <label>
        Clave
        <input v-model="form.password" type="password" required />
      </label>

      <button :disabled="authStore.loading" type="submit">
        {{ authStore.loading ? "Ingresando..." : "Entrar" }}
      </button>

      <p v-if="authStore.error" class="auth__error">{{ authStore.error }}</p>
    </form>
  </section>
</template>

<style scoped>
.auth {
  display: grid;
  place-items: center;
  min-height: 70vh;
}

.auth__card {
  width: min(28rem, 100%);
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1.5rem;
  display: grid;
  gap: 0.8rem;
}

.auth__card input,
.auth__card select {
  width: 100%;
  margin-top: 0.25rem;
  padding: 0.6rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.6rem;
}

.auth__card button {
  border: 0;
  background: #0f172a;
  color: #fff;
  padding: 0.7rem;
  border-radius: 0.6rem;
  cursor: pointer;
}

.auth__hint {
  color: #334155;
  font-size: 0.9rem;
}

.auth__error {
  color: #be123c;
  font-size: 0.9rem;
}
</style>
