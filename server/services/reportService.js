import sequelize from "../config/database.js";

export async function getCriticalInventoryReport() {
  const query = `
    WITH available_copies AS (
      SELECT
        id_pelicula,
        COUNT(*) AS copias_disponibles
      FROM copias
      WHERE estado_copia = 'Disponible'
      GROUP BY id_pelicula
    ),
    recent_rentals AS (
      SELECT
        c.id_pelicula,
        COUNT(*) AS alquileres_ultimo_mes
      FROM alquileres a
      INNER JOIN copias c ON c.id_copia = a.id_copia
      WHERE a.fecha_salida >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
      GROUP BY c.id_pelicula
    )
    SELECT
      p.id_pelicula,
      p.titulo,
      p.genero,
      p.anio,
      p.clasificacion,
      COALESCE(ac.copias_disponibles, 0) AS copias_disponibles,
      COALESCE(rr.alquileres_ultimo_mes, 0) AS alquileres_ultimo_mes
    FROM peliculas p
    LEFT JOIN available_copies ac ON ac.id_pelicula = p.id_pelicula
    LEFT JOIN recent_rentals rr ON rr.id_pelicula = p.id_pelicula
    WHERE COALESCE(ac.copias_disponibles, 0) < 2
      AND COALESCE(rr.alquileres_ultimo_mes, 0) > 5
    ORDER BY alquileres_ultimo_mes DESC, copias_disponibles ASC, p.titulo ASC;
  `;

  const [rows] = await sequelize.query(query);

  return rows;
}

export default {
  getCriticalInventoryReport,
};
