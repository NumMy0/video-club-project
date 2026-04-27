import { describe, expect, it, vi } from "vitest";

const { queryMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
}));

vi.mock("../config/database.js", () => ({
  default: {
    query: queryMock,
  },
}));

import { getCriticalInventoryReport } from "../services/reportService.js";

describe("getCriticalInventoryReport", () => {
  it("ejecuta la consulta compleja y devuelve los registros", async () => {
    const rows = [
      {
        id_pelicula: 1,
        titulo: "Matrix",
        copias_disponibles: 1,
        alquileres_ultimo_mes: 8,
      },
    ];

    queryMock.mockResolvedValueOnce([rows]);

    const result = await getCriticalInventoryReport();

    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(queryMock.mock.calls[0][0]).toContain("WITH available_copies AS");
    expect(queryMock.mock.calls[0][0]).toContain(
      "COALESCE(ac.copias_disponibles, 0) < 2",
    );
    expect(queryMock.mock.calls[0][0]).toContain(
      "COALESCE(rr.alquileres_ultimo_mes, 0) > 5",
    );
    expect(result).toEqual(rows);
  });
});
