import { getCriticalInventoryReport } from "../services/reportService.js";

export async function criticalInventoryReport(_req, res) {
  try {
    const data = await getCriticalInventoryReport();

    return res.status(200).json({
      message: "Inventario crítico obtenido correctamente",
      data,
    });
  } catch (error) {
    console.error("Error al obtener el inventario crítico:", error);

    return res.status(500).json({
      message: "No se pudo obtener el inventario crítico",
    });
  }
}

export default {
  criticalInventoryReport,
};
