import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { authApi } from "@/api/services";

type Rol = "Admin" | "Vendedor" | "Socio";

type User = {
  rol: Rol;
  nombre: string;
  usuario?: string;
  dni?: string;
  id_usuario?: number;
};

const TOKEN_KEY = "jwt";
const initialToken = localStorage.getItem(TOKEN_KEY) ?? "";

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string>(initialToken);
  const user = ref<User | null>(null);
  const sessionReady = ref(!initialToken);
  const loading = ref(false);
  const error = ref("");

  const isAuthenticated = computed(() => Boolean(token.value));
  const role = computed(() => user.value?.rol ?? null);

  async function login(payload: { identifier: string; password: string; role: Rol }) {
    loading.value = true;
    error.value = "";

    try {
      const { data } = await authApi.login(payload);
      token.value = data.token;
      user.value = data.user;
      sessionReady.value = true;
      localStorage.setItem(TOKEN_KEY, data.token);
    } catch (_err) {
      error.value = "Credenciales invalidas";
      throw _err;
    } finally {
      loading.value = false;
    }
  }

  async function hydrateSession() {
    if (!token.value) {
      user.value = null;
      sessionReady.value = true;
      return;
    }

    try {
      const { data } = await authApi.me();
      user.value = data.user;
    } catch (_error) {
      logout();
      return;
    }

    sessionReady.value = true;
  }

  function logout() {
    token.value = "";
    user.value = null;
    sessionReady.value = true;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("token");
  }

  return {
    token,
    user,
    loading,
    error,
    sessionReady,
    role,
    isAuthenticated,
    login,
    hydrateSession,
    logout,
  };
});
