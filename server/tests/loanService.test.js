import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { transactionMock, findByPkMock } = vi.hoisted(() => ({
  transactionMock: vi.fn(),
  findByPkMock: vi.fn(),
}));

vi.mock("../config/database.js", () => ({
  default: {
    transaction: transactionMock,
  },
}));

vi.mock("../models/index.js", () => ({
  Alquiler: {
    findByPk: findByPkMock,
  },
  Copia: {},
  Socio: {},
}));

import { registrarDevolucion } from "../services/loanService.js";

describe("registrarDevolucion", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-03T12:00:00Z"));
    transactionMock.mockReset();
    findByPkMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("cierra la devolución sin multa cuando no hay retraso", async () => {
    const commitMock = vi.fn();
    const rollbackMock = vi.fn();
    const saveLoanMock = vi.fn();
    const saveCopyMock = vi.fn();
    const saveSocioMock = vi.fn();

    transactionMock.mockResolvedValueOnce({
      commit: commitMock,
      rollback: rollbackMock,
      LOCK: { UPDATE: "UPDATE" },
    });

    findByPkMock.mockResolvedValueOnce({
      fecha_limite: new Date("2026-04-04T12:00:00Z"),
      fecha_retorno: null,
      save: saveLoanMock,
      copia: {
        estado_copia: "Alquilada",
        save: saveCopyMock,
      },
      socio: {
        estado_cuenta: "Activo",
        save: saveSocioMock,
      },
    });

    const result = await registrarDevolucion(10);

    expect(transactionMock).toHaveBeenCalledTimes(1);
    expect(findByPkMock).toHaveBeenCalledWith(
      10,
      expect.objectContaining({ transaction: expect.any(Object) }),
    );
    expect(result.diasRetraso).toBe(0);
    expect(result.multa).toBe(0);
    expect(saveLoanMock).toHaveBeenCalledTimes(1);
    expect(saveCopyMock).toHaveBeenCalledTimes(1);
    expect(saveSocioMock).not.toHaveBeenCalled();
    expect(commitMock).toHaveBeenCalledTimes(1);
    expect(rollbackMock).not.toHaveBeenCalled();
    expect(result.alquiler.fecha_retorno).toBeInstanceOf(Date);
    expect(result.alquiler.copia.estado_copia).toBe("Disponible");
  });

  it("aplica multa y marca al socio como deudor cuando hay retraso", async () => {
    const commitMock = vi.fn();
    const rollbackMock = vi.fn();
    const saveLoanMock = vi.fn();
    const saveCopyMock = vi.fn();
    const saveSocioMock = vi.fn();

    transactionMock.mockResolvedValueOnce({
      commit: commitMock,
      rollback: rollbackMock,
      LOCK: { UPDATE: "UPDATE" },
    });

    findByPkMock.mockResolvedValueOnce({
      fecha_limite: new Date("2026-04-01T12:00:00Z"),
      fecha_retorno: null,
      save: saveLoanMock,
      copia: {
        estado_copia: "Alquilada",
        save: saveCopyMock,
      },
      socio: {
        estado_cuenta: "Activo",
        save: saveSocioMock,
      },
    });

    const result = await registrarDevolucion(11);

    expect(result.diasRetraso).toBe(2);
    expect(result.multa).toBe(4);
    expect(saveSocioMock).toHaveBeenCalledTimes(1);
    expect(result.alquiler.socio.estado_cuenta).toBe("Deudor");
    expect(result.alquiler.copia.estado_copia).toBe("Disponible");
    expect(commitMock).toHaveBeenCalledTimes(1);
    expect(rollbackMock).not.toHaveBeenCalled();
  });
});
