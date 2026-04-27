import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
  {
    path: "/",
    redirect: "/catalogo",
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/LoginView.vue"),
    meta: { public: true },
  },
  {
    path: "/catalogo",
    name: "catalogo",
    component: () => import("@/views/CatalogView.vue"),
    meta: { roles: ["Socio", "Admin", "Vendedor"] },
  },
  {
    path: "/historial",
    name: "historial",
    component: () => import("@/views/HistoryView.vue"),
    meta: { roles: ["Socio"] },
  },
  {
    path: "/staff",
    name: "staff-dashboard",
    component: () => import("@/views/StaffDashboardView.vue"),
    meta: { roles: ["Admin", "Vendedor"] },
  },
  {
    path: "/staff/socios",
    name: "staff-socios",
    component: () => import("@/views/StaffSociosView.vue"),
    meta: { roles: ["Admin", "Vendedor"] },
  },
  {
    path: "/staff/devoluciones",
    name: "staff-devoluciones",
    component: () => import("@/views/StaffReturnsView.vue"),
    meta: { roles: ["Admin", "Vendedor"] },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  if (!authStore.user && authStore.token) {
    await authStore.hydrateSession();
  }

  if (to.meta.public) {
    return true;
  }

  if (!authStore.isAuthenticated) {
    return { name: "login", query: { redirect: to.fullPath } };
  }

  const allowedRoles = to.meta.roles as Array<string> | undefined;

  if (allowedRoles && authStore.role && !allowedRoles.includes(authStore.role)) {
    return { name: "catalogo" };
  }

  return true;
});

export default router;
