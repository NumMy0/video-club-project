import { describe, expect, it, vi } from "vitest";

const { getCriticalInventoryReportMock } = vi.hoisted(() => ({
  getCriticalInventoryReportMock: vi.fn(),
}));

vi.mock("../services/reportService.js", () => ({
  getCriticalInventoryReport: getCriticalInventoryReportMock,
}));

import { criticalInventoryReport } from "../controllers/reportController.js";

describe("criticalInventoryReport", () => {
  it("responde 200 con los datos del reporte", async () => {
    const jsonMock = vi.fn();
    const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

    getCriticalInventoryReportMock.mockResolvedValueOnce([
      { titulo: "Matrix" },
    ]);

    await criticalInventoryReport({}, { status: statusMock });

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Inventario crítico obtenido correctamente",
      data: [{ titulo: "Matrix" }],
    });
  });
});
