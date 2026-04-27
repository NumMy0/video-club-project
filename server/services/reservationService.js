import sequelize from "../config/database.js";

function normalizarFechaLimite(fechaLimite) {
  if (fechaLimite) {
    return new Date(fechaLimite);
  }

  const limite = new Date();
  limite.setDate(limite.getDate() + 3);

  return limite;
}

export async function crearReserva({
  idCopia,
  idPelicula,
  dniSocio,
  fechaLimite,
  idUsuario,
  observaciones,
}) {
  console.log("[reservationService] input", {
    idCopia,
    idPelicula,
    dniSocio,
    fechaLimite,
    idUsuario,
    observaciones,
  });

  const transaction = await sequelize.transaction();

  try {
    const [copias] = await sequelize.query(
      `
      SELECT id_copia, estado_copia
      FROM copias
      WHERE (:idCopia IS NOT NULL AND id_copia = :idCopia)
         OR (:idPelicula IS NOT NULL AND id_pelicula = :idPelicula AND estado_copia = 'Disponible')
      ORDER BY id_copia ASC
      LIMIT 1
      FOR UPDATE
      `,
      {
        replacements: {
          idCopia: idCopia ?? null,
          idPelicula: idPelicula ?? null,
        },
        transaction,
      },
    );

    console.log("[reservationService] copias encontradas", copias);

    const copia = copias[0];
    const idCopiaSeleccionada = copia?.id_copia;

    if (!copia || !idCopiaSeleccionada) {
      console.warn("[reservationService] no se encontró copia disponible");
      throw new Error("Copia no encontrada");
    }

    if (copia.estado_copia !== "Disponible") {
      throw new Error("La copia no esta disponible para reserva");
    }

    const [socios] = await sequelize.query(
      `
      SELECT dni, estado_cuenta
      FROM socios
      WHERE dni = :dniSocio
      LIMIT 1
      `,
      {
        replacements: { dniSocio },
        transaction,
      },
    );

    console.log("[reservationService] socio encontrado", socios[0]);

    const socio = socios[0];

    if (!socio || socio.estado_cuenta === "Deudor") {
      throw new Error("Socio no habilitado para reservar");
    }

    const fechaLimiteNormalizada = normalizarFechaLimite(fechaLimite);

    const [insertResult] = await sequelize.query(
      `
      INSERT INTO alquileres (
        dni_socio,
        id_copia,
        fecha_salida,
        fecha_limite,
        fecha_retorno,
        id_usuario,
        observaciones
      ) VALUES (
        :dniSocio,
        :idCopia,
        NOW(),
        :fechaLimite,
        NULL,
        :idUsuario,
        :observaciones
      )
      `,
      {
        replacements: {
          dniSocio,
          idCopia: idCopiaSeleccionada,
          fechaLimite: fechaLimiteNormalizada,
          idUsuario: idUsuario ?? null,
          observaciones: observaciones ?? "Reserva web",
        },
        transaction,
      },
    );

    console.log("[reservationService] insertResult", insertResult);

    await sequelize.query(
      `
      UPDATE copias
      SET estado_copia = 'Reservada'
      WHERE id_copia = :idCopia
      `,
      {
        replacements: { idCopia: idCopiaSeleccionada },
        transaction,
      },
    );

    await transaction.commit();

    return {
      id_alquiler: insertResult.insertId,
      id_copia: Number(idCopiaSeleccionada),
      id_pelicula: idPelicula ?? null,
      dni_socio: dniSocio,
      estado_copia: "Reservada",
      fecha_limite: fechaLimiteNormalizada,
    };
  } catch (error) {
    console.error("[reservationService] error", error);
    await transaction.rollback();
    throw error;
  }
}

export async function getHistorialSocio(dniSocio) {
  const [rows] = await sequelize.query(
    `
    SELECT
      a.id_alquiler,
      a.fecha_salida,
      a.fecha_limite,
      a.fecha_retorno,
      a.observaciones,
      c.id_copia,
      c.formato,
      c.estado_copia,
      p.id_pelicula,
      p.titulo,
      p.genero,
      p.anio,
      COALESCE(SUM(pg.monto), 0) AS total_pagado,
      SUM(CASE WHEN pg.estado_pago = 'Pendiente' THEN pg.monto ELSE 0 END) AS saldo_pendiente
    FROM alquileres a
    INNER JOIN copias c ON c.id_copia = a.id_copia
    INNER JOIN peliculas p ON p.id_pelicula = c.id_pelicula
    LEFT JOIN pagos pg ON pg.id_alquiler = a.id_alquiler
    WHERE a.dni_socio = :dniSocio
    GROUP BY
      a.id_alquiler,
      a.fecha_salida,
      a.fecha_limite,
      a.fecha_retorno,
      a.observaciones,
      c.id_copia,
      c.formato,
      c.estado_copia,
      p.id_pelicula,
      p.titulo,
      p.genero,
      p.anio
    ORDER BY a.fecha_salida DESC
    `,
    {
      replacements: { dniSocio },
    },
  );

  return rows;
}

export default {
  crearReserva,
  getHistorialSocio,
};
