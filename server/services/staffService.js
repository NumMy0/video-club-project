import sequelize from "../config/database.js";

export async function getSocios() {
  const [rows] = await sequelize.query(
    `
    SELECT dni, nombre, direccion, telefono, estado_cuenta, email
    FROM socios
    ORDER BY nombre ASC
    `,
  );

  return rows;
}

export async function getResumenOperativo() {
  const [[totales]] = await sequelize.query(
    `
    SELECT
      (SELECT COUNT(*) FROM alquileres WHERE fecha_retorno IS NULL) AS alquileres_activos,
      (SELECT COUNT(*) FROM alquileres WHERE fecha_retorno IS NULL AND fecha_limite < NOW()) AS alquileres_vencidos,
      (SELECT COUNT(*) FROM copias WHERE estado_copia = 'Disponible') AS copias_disponibles,
      (SELECT COUNT(*) FROM copias WHERE estado_copia = 'Reservada') AS copias_reservadas,
      (SELECT COUNT(*) FROM copias WHERE estado_copia = 'Alquilada') AS copias_alquiladas
    `,
  );

  return totales;
}

export default {
  getSocios,
  getResumenOperativo,
};
