import sequelize from "../config/database.js";
import { Alquiler, Copia, Socio } from "../models/index.js";

const MULTA_DIARIA = 2;
const MILISEGUNDOS_POR_DIA = 1000 * 60 * 60 * 24;

function calcularDiasRetraso(fechaRetorno, fechaLimite) {
  const diferenciaMs = fechaRetorno.getTime() - fechaLimite.getTime();

  if (diferenciaMs <= 0) {
    return 0;
  }

  return Math.ceil(diferenciaMs / MILISEGUNDOS_POR_DIA);
}

export async function registrarDevolucion(idAlquiler) {
  const transaction = await sequelize.transaction();

  try {
    const alquiler = await Alquiler.findByPk(idAlquiler, {
      include: [
        { model: Copia, as: "copia" },
        { model: Socio, as: "socio" },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!alquiler) {
      throw new Error("Alquiler no encontrado");
    }

    const fechaActual = new Date();
    const fechaMaximaRetorno = alquiler.fecha_limite;
    const diasRetraso = calcularDiasRetraso(fechaActual, fechaMaximaRetorno);
    const multa = diasRetraso > 0 ? diasRetraso * MULTA_DIARIA : 0;

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
  registrarDevolucion,
};
