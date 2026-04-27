<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import api from '@/api/axios.js'
import { useAuthStore } from '@/stores/auth'
import { useOperationsStore } from '@/stores/operations'

type Pelicula = {
  id_pelicula?: number | string
  titulo: string
  genero?: string
  anio?: number | string
  clasificacion?: string
  descripcion?: string
  copias?: Array<unknown>
  copias_disponibles?: number
  cantidad_copias?: number
  total_copias?: number
  estado?: string
}

const peliculas = ref<Pelicula[]>([])
const busqueda = ref('')
const cargando = ref(false)
const error = ref('')
const reservandoId = ref<number | null>(null)
let reservationMessageTimer: number | undefined

const authStore = useAuthStore()
const operationsStore = useOperationsStore()
const FALLBACK_POSTER = '/images/default-poster.svg'

const postersPorTitulo: Record<string, string> = {
  gladiator: 'gladiator.webp',
  gladiador: 'gladiator.webp',
  'the dark knight': 'The dark knight.webp',
  whiplash: 'wiplash.webp',
  'el caballero oscuro': 'The dark knight.webp',
  arrival: 'Arrival.webp',
  'la llegada': 'Arrival.webp',
  'the shawshank redemption': 'Cadena perpetua.webp',
  'cadena perpetua': 'Cadena perpetua.webp',
  'sueno de fuga': 'Cadena perpetua.webp',
  'blade runner 2049': 'blade-runner-2049.webp',
  interstellar: 'Interestellar.webp',
  interestellar: 'Interestellar.webp',
  inception: 'inception.webp',
  origen: 'inception.webp',
  parasite: 'Parasite.webp',
  parasitos: 'Parasite.webp',
  madmax: 'Mad-max.webp'
}

function normalizarTitulo(titulo: string): string {
  return titulo
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
}

function obtenerPoster(pelicula: Pelicula): string {
  const key = normalizarTitulo(pelicula.titulo)
  const archivo = postersPorTitulo[key]

  if (!archivo) {
    return FALLBACK_POSTER
  }

  return `/images/${encodeURIComponent(archivo)}`
}

function onPosterError(event: Event) {
  const image = event.target as HTMLImageElement

  if (image.dataset.fallbackApplied === '1') {
    return
  }

  image.dataset.fallbackApplied = '1'
  image.src = FALLBACK_POSTER
}

function normalizarPeliculas(payload: unknown): Pelicula[] {
  if (Array.isArray(payload)) {
    return payload as Pelicula[]
  }

  if (payload && typeof payload === 'object') {
    const data = (payload as { data?: unknown }).data

    if (Array.isArray(data)) {
      return data as Pelicula[]
    }
  }

  return []
}

function obtenerCantidadCopias(pelicula: Pelicula): number {
  if (Array.isArray(pelicula.copias)) {
    return pelicula.copias.length
  }

  if (typeof pelicula.copias_disponibles === 'number') {
    return pelicula.copias_disponibles
  }

  if (typeof pelicula.cantidad_copias === 'number') {
    return pelicula.cantidad_copias
  }

  if (typeof pelicula.total_copias === 'number') {
    return pelicula.total_copias
  }

  return 0
}

function estaDisponible(pelicula: Pelicula): boolean {
  return obtenerCantidadCopias(pelicula) > 0
}

function puedeReservar(): boolean {
  return authStore.role === 'Socio' && authStore.isAuthenticated
}

watch(
  () => operationsStore.reservationMessage,
  (message) => {
    if (reservationMessageTimer) {
      window.clearTimeout(reservationMessageTimer)
      reservationMessageTimer = undefined
    }

    if (message) {
      reservationMessageTimer = window.setTimeout(() => {
        operationsStore.clearReservationMessage()
        reservationMessageTimer = undefined
      }, 4000)
    }
  },
)

async function reservarPelicula(pelicula: Pelicula) {
  const idPelicula = Number(pelicula.id_pelicula)

  console.log("[MovieCatalog] reservarPelicula", {
    idPelicula,
    role: authStore.role,
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.user,
  })

  if (!idPelicula || !puedeReservar()) {
    console.warn("[MovieCatalog] reserva bloqueada", {
      idPelicula,
      role: authStore.role,
      isAuthenticated: authStore.isAuthenticated,
    })
    return
  }

  reservandoId.value = idPelicula
  error.value = ''

  try {
    await operationsStore.crearReserva(idPelicula)
    await cargarPeliculas()
  } catch (err) {
    console.error("[MovieCatalog] error al reservar", err)
    error.value = operationsStore.error || 'No se pudo reservar la pelicula.'
  } finally {
    reservandoId.value = null
  }
}

async function cargarPeliculas() {
  cargando.value = true
  error.value = ''

  try {
    const response = await api.get('/peliculas')
    peliculas.value = normalizarPeliculas(response.data)
  } catch (err) {
    error.value = 'No se pudieron cargar las películas.'
    peliculas.value = []
    console.error(err)
  } finally {
    cargando.value = false
  }
}

const peliculasFiltradas = computed(() => {
  const textoBusqueda = busqueda.value.trim().toLowerCase()

  if (!textoBusqueda) {
    return peliculas.value
  }

  return peliculas.value.filter((pelicula) =>
    pelicula.titulo.toLowerCase().includes(textoBusqueda),
  )
})

onMounted(() => {
  cargarPeliculas()
})

onBeforeUnmount(() => {
  if (reservationMessageTimer) {
    window.clearTimeout(reservationMessageTimer)
  }
})
</script>

<template>
  <section class="catalog">
    <div class="catalog__header">
      <div>
        <p class="catalog__eyebrow">Cinemateca</p>
        <h1 class="catalog__title">Catálogo de Películas</h1>
        <p class="catalog__subtitle">
          Explora el inventario en tiempo real y revisa rápidamente qué títulos tienen copias
          disponibles.
        </p>
      </div>

      <div class="catalog__searchWrap">
        <label class="sr-only" for="busqueda-peliculas">Buscar película</label>
        <input
          id="busqueda-peliculas"
          v-model="busqueda"
          type="search"
          placeholder="Buscar por título..."
          class="catalog__search"
        />
      </div>
    </div>

    <div v-if="cargando" class="catalog__state">Cargando películas...</div>

    <div v-else-if="error" class="catalog__state catalog__state--error">
      {{ error }}
    </div>

    <div v-if="operationsStore.reservationMessage" class="catalog__state catalog__state--success">
      {{ operationsStore.reservationMessage }}
    </div>

    <div v-if="!cargando && !error && peliculasFiltradas.length === 0" class="catalog__state catalog__state--empty">
      No se encontraron películas para la búsqueda actual.
    </div>

    <div v-if="!cargando && !error && peliculasFiltradas.length > 0" class="catalog__grid">
      <article
        v-for="pelicula in peliculasFiltradas"
        :key="pelicula.id_pelicula ?? pelicula.titulo"
        class="movie-card"
      >
        <figure class="movie-card__media">
          <img
            :src="obtenerPoster(pelicula)"
            :alt="`Poster de ${pelicula.titulo}`"
            class="movie-card__img"
            loading="lazy"
            decoding="async"
            @error="onPosterError"
          />
        </figure>

        <div class="movie-card__body">
          <div class="movie-card__top">
            <div>
              <p class="movie-card__genre">
                {{ pelicula.genero ?? 'Sin género' }}
              </p>
              <h2 class="movie-card__title">
                {{ pelicula.titulo }}
              </h2>
            </div>

            <span
              class="movie-card__badge"
              :class="estaDisponible(pelicula) ? 'movie-card__badge--available' : 'movie-card__badge--unavailable'"
            >
              {{ estaDisponible(pelicula) ? 'Disponible' : 'No disponible' }}
            </span>
          </div>

          <div class="movie-card__details">
            <p v-if="pelicula.anio">
              <span class="movie-card__label">Año:</span>
              {{ pelicula.anio }}
            </p>
            <p v-if="pelicula.clasificacion">
              <span class="movie-card__label">Clasificación:</span>
              {{ pelicula.clasificacion }}
            </p>
            <p>
              <span class="movie-card__label">Copias:</span>
              {{ obtenerCantidadCopias(pelicula) }}
            </p>
            <p v-if="pelicula.descripcion" class="movie-card__description">
              {{ pelicula.descripcion }}
            </p>
          </div>

          <div class="movie-card__actions">
            <button
              v-if="puedeReservar()"
              class="movie-card__action"
              :disabled="!estaDisponible(pelicula) || reservandoId === Number(pelicula.id_pelicula)"
              @click="reservarPelicula(pelicula)"
            >
              {{
                reservandoId === Number(pelicula.id_pelicula)
                  ? 'Reservando...'
                  : estaDisponible(pelicula)
                    ? 'Reservar'
                    : 'Sin copias'
              }}
            </button>

            <p v-if="authStore.isAuthenticated && authStore.role !== 'Socio'" class="movie-card__note">
              La reserva web solo esta habilitada para socios.
            </p>

          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.catalog {
  width: 100%;
  max-width: 80rem;
  margin: 0 auto;
  padding: 2.5rem 1rem;
}

.catalog__header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.catalog__eyebrow {
  color: #0369a1;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.25em;
  text-transform: uppercase;
}

.catalog__title {
  margin-top: 0.5rem;
  color: #0f172a;
  font-size: clamp(2rem, 5vw, 2.5rem);
  font-weight: 800;
  line-height: 1.1;
}

.catalog__subtitle {
  margin-top: 0.75rem;
  max-width: 42rem;
  color: #475569;
  font-size: 1rem;
}

.catalog__searchWrap {
  width: 100%;
}

.catalog__search {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.92);
  color: #0f172a;
  font-size: 1rem;
  padding: 0.9rem 1rem;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.catalog__search::placeholder {
  color: #94a3b8;
}

.catalog__search:focus {
  border-color: #38bdf8;
  box-shadow: 0 0 0 4px rgba(186, 230, 253, 0.8);
}

.catalog__state {
  border: 1px solid #cbd5e1;
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  color: #475569;
  padding: 2rem;
}

.catalog__state--error {
  border-color: #fecdd3;
  background: #fff1f2;
  color: #be123c;
}

.catalog__state--empty {
  border-style: dashed;
  text-align: center;
}

.catalog__state--success {
  border-color: #bbf7d0;
  background: #f0fdf4;
  color: #166534;
}

.catalog__state--success::before {
  content: "Reserva realizada";
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin-bottom: 0.35rem;
  color: #15803d;
}

.catalog__grid {
  display: grid;
  gap: 1.5rem;
}

.movie-card {
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.movie-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.12);
}

.movie-card__media {
  aspect-ratio: 2 / 3;
  background: #e2e8f0;
}

.movie-card__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.movie-card__body {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1.5rem;
}

.movie-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.movie-card__genre {
  color: #0369a1;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.movie-card__title {
  margin-top: 0.5rem;
  color: #0f172a;
  font-size: 1.25rem;
  font-weight: 700;
}

.movie-card__badge {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.35rem 0.75rem;
  white-space: nowrap;
}

.movie-card__badge--available {
  background: #dcfce7;
  color: #15803d;
}

.movie-card__badge--unavailable {
  background: #ffe4e6;
  color: #be123c;
}

.movie-card__details {
  margin-top: 1.25rem;
  color: #475569;
  display: grid;
  gap: 0.75rem;
  font-size: 0.95rem;
}

.movie-card__label {
  color: #1e293b;
  font-weight: 600;
}

.movie-card__description {
  color: #475569;
}

.movie-card__actions {
  margin-top: 1rem;
  display: grid;
  gap: 0.5rem;
}

.movie-card__action {
  border: 0;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  background: #0f172a;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.movie-card__action:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.movie-card__note {
  color: #64748b;
  font-size: 0.85rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (min-width: 640px) {
  .catalog {
    padding-inline: 1.5rem;
  }

  .catalog__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .catalog__header {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }

  .catalog__searchWrap {
    max-width: 24rem;
  }
}

@media (min-width: 1280px) {
  .catalog__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>