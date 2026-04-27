import sequelize from "../config/database.js";

export async function getPeliculasCatalogo() {
  const query = `
    SELECT
      p.id_pelicula,
      p.titulo,
      p.genero,
      p.anio,
      p.clasificacion,
      p.descripcion,
      COUNT(c.id_copia) AS total_copias,
      COALESCE(SUM(CASE WHEN c.estado_copia = 'Disponible' THEN 1 ELSE 0 END), 0) AS copias_disponibles
    FROM peliculas p
    LEFT JOIN copias c ON c.id_pelicula = p.id_pelicula
    GROUP BY
      p.id_pelicula,
      p.titulo,
      p.genero,
      p.anio,
      p.clasificacion,
      p.descripcion
    ORDER BY p.titulo ASC;
  `;

  const [rows] = await sequelize.query(query);

  return rows;
}

export default {
  getPeliculasCatalogo,
};
