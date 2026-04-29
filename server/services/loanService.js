import sequelize from "../config/database.js";
import { Alquiler, Copia, Pelicula, Socio } from "../models/index.js";

const MULTA_DIARIA = 2;
const MILISEGUNDOS_POR_DIA = 1000 * 60 * 60 * 24;

function calcularDiasRetraso(fechaRetorno, fechaLimite) {
  const diferenciaMs = fechaRetorno.getTime() - fechaLimite.getTime();

  if (diferenciaMs <= 0) {
    return 0;
  }

  return Math.ceil(diferenciaMs / MILISEGUNDOS_POR_DIA);
}

function calcularMulta(fechaActual, fechaLimite) {
  const diasRetraso = calcularDiasRetraso(fechaActual, fechaLimite);

  return {
    diasRetraso,
    multa: diasRetraso > 0 ? diasRetraso * MULTA_DIARIA : 0,
  };
}

export async function getAlquileresPendientes() {
  const [rows] = await sequelize.query(
    `
    SELECT
      a.id_alquiler,
      a.dni_socio,
      a.id_copia,
      a.fecha_salida,
      a.fecha_limite,
      s.nombre AS socio_nombre,
      c.formato,
      p.titulo AS pelicula_titulo
    FROM alquileres a
    INNER JOIN socios s ON s.dni = a.dni_socio
    INNER JOIN copias c ON c.id_copia = a.id_copia
    INNER JOIN peliculas p ON p.id_pelicula = c.id_pelicula
    WHERE a.fecha_retorno IS NULL
    ORDER BY a.fecha_limite ASC
    `,
  );

  const ahora = new Date();

  return rows.map((item) => {
    const fechaLimite = new Date(item.fecha_limite);
    const { diasRetraso, multa } = calcularMulta(ahora, fechaLimite);

    return {
      ...item,
      diasRetraso,
      multa,
    };
  });
}

async function cargarAlquiler(idAlquiler, transaction) {
  return Alquiler.findByPk(idAlquiler, {
    include: [
      {
        model: Copia,
        as: "copia",
        include: [{ model: Pelicula, as: "pelicula" }],
      },
      { model: Socio, as: "socio" },
    ],
    transaction,
    lock: transaction ? transaction.LOCK.UPDATE : undefined,
  });
}

export async function getAlquilerDetalle(idAlquiler) {
  const alquiler = await cargarAlquiler(idAlquiler);

  if (!alquiler) {
    throw new Error("Alquiler no encontrado");
  }

  const fechaActual = new Date();
  const { diasRetraso, multa } = calcularMulta(
    fechaActual,
    alquiler.fecha_limite,
  );

  return {
    id_alquiler: alquiler.id_alquiler,
    dni_socio: alquiler.dni_socio,
    id_copia: alquiler.id_copia,
    fecha_salida: alquiler.fecha_salida,
    fecha_limite: alquiler.fecha_limite,
    fecha_retorno: alquiler.fecha_retorno,
    observaciones: alquiler.observaciones,
    diasRetraso,
    multa,
    socio: alquiler.socio
      ? {
          dni: alquiler.socio.dni,
          nombre: alquiler.socio.nombre,
          estado_cuenta: alquiler.socio.estado_cuenta,
        }
      : null,
    copia: alquiler.copia
      ? {
          id_copia: alquiler.copia.id_copia,
          formato: alquiler.copia.formato,
          estado_copia: alquiler.copia.estado_copia,
          pelicula: alquiler.copia.pelicula
            ? {
                id_pelicula: alquiler.copia.pelicula.id_pelicula,
                titulo: alquiler.copia.pelicula.titulo,
                genero: alquiler.copia.pelicula.genero,
              }
            : null,
        }
      : null,
  };
}

export async function registrarDevolucion(idAlquiler) {
  const transaction = await sequelize.transaction();

  try {
    const alquiler = await cargarAlquiler(idAlquiler, transaction);

    if (!alquiler) {
      throw new Error("Alquiler no encontrado");
    }

    if (alquiler.fecha_retorno) {
      throw new Error("El alquiler ya fue devuelto");
    }

    const fechaActual = new Date();
    const fechaMaximaRetorno = alquiler.fecha_limite;
    const { diasRetraso, multa } = calcularMulta(
      fechaActual,
      fechaMaximaRetorno,
    );

    alquiler.fecha_retorno = fechaActual;

    await alquiler.save({ transaction: transaction });

    if (alquiler.copia) {
      alquiler.copia.estado_copia = "Disponible";
      await alquiler.copia.save({ transaction: transaction });
    }

    if (diasRetraso > 0 && alquiler.socio) {
      alquiler.socio.estado_cuenta = "Deudor";
      await alquiler.socio.save({ transaction: transaction });
    }

    await transaction.commit();

    return {
      alquiler,
      diasRetraso,
      multa,
      fechaMaximaRetorno,
      fechaActual,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export default {
  getAlquileresPendientes,
  getAlquilerDetalle,
  registrarDevolucion,
};
