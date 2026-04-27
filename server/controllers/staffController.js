import { registrarDevolucion } from "../services/loanService.js";
import { getResumenOperativo, getSocios } from "../services/staffService.js";

export async function listarSociosController(_req, res) {
  try {
    const data = await getSocios();

    return res.status(200).json({ data });
  } catch (_error) {
    return res
      .status(500)
      .json({ message: "No se pudieron obtener los socios" });
  }
}

export async function devolucionController(req, res) {
  try {
    const idAlquiler = Number(req.params.idAlquiler);

    if (!idAlquiler) {
      return res.status(400).json({ message: "idAlquiler invalido" });
    }

    const data = await registrarDevolucion(idAlquiler);

    return res.status(200).json({
      message: "Devolucion registrada",
      data,
    });
  } catch (error) {
    const status = /no encontrado/i.test(error.message) ? 404 : 500;

    return res.status(status).json({ message: error.message });
  }
}

export async function resumenOperativoController(_req, res) {
  try {
    const data = await getResumenOperativo();

    return res.status(200).json({ data });
  } catch (_error) {
    return res
      .status(500)
      .json({ message: "No se pudo obtener el resumen operativo" });
  }
}

export default {
  listarSociosController,
  devolucionController,
  resumenOperativoController,
};
