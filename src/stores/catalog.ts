import { defineStore } from "pinia";
import { ref } from "vue";
import { catalogApi } from "@/api/services";

type Pelicula = {
  id_pelicula: number;
  titulo: string;
  genero: string;
  anio: number;
  clasificacion: string;
  descripcion?: string;
  total_copias: number;
  copias_disponibles: number;
};

export const useCatalogStore = defineStore("catalog", () => {
  const peliculas = ref<Pelicula[]>([]);
  const loading = ref(false);
  const error = ref("");

  async function fetchPeliculas() {
    loading.value = true;
    error.value = "";

    try {
      const { data } = await catalogApi.list();
      peliculas.value = Array.isArray(data?.data) ? data.data : [];
    } catch (_error) {
      error.value = "No se pudo cargar el catalogo";
      peliculas.value = [];
    } finally {
      loading.value = false;
    }
  }

  return {
    peliculas,
    loading,
    error,
    fetchPeliculas,
  };
});
