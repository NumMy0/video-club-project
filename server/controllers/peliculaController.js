import { getPeliculasCatalogo } from "../services/peliculaService.js";

export async function getPeliculas(_req, res) {
  try {
    const data = await getPeliculasCatalogo();

    return res.status(200).json({ data });
  } catch (error) {
    console.error("Error al obtener peliculas:", error);

    return res.status(500).json({
      message: "No se pudieron obtener las peliculas",
    });
  }
}

export default {
  getPeliculas,
};
