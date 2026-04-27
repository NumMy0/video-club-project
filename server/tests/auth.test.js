import { describe, expect, it, vi } from "vitest";

const { verifyMock } = vi.hoisted(() => ({
  verifyMock: vi.fn(),
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: verifyMock,
  },
}));

import auth from "../middlewares/auth.js";

function createResponseMock() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("auth middleware", () => {
  it("responde 401 si no hay token", () => {
    const middleware = auth(["Admin"]);
    const req = { headers: {} };
    const res = createResponseMock();
    const next = vi.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("permite el acceso cuando el token y el rol son válidos", () => {
    verifyMock.mockReturnValueOnce({ rol: "Admin" });

    const middleware = auth(["Admin", "Vendedor"]);
    const req = { headers: { authorization: "Bearer token-valido" } };
    const res = createResponseMock();
    const next = vi.fn();

    middleware(req, res, next);

    expect(verifyMock).toHaveBeenCalledWith("token-valido", expect.any(String));
    expect(req.user).toEqual({ rol: "Admin" });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("responde 403 si el rol no está permitido", () => {
    verifyMock.mockReturnValueOnce({ rol: "Socio" });

    const middleware = auth(["Admin"]);
    const req = { headers: { authorization: "Bearer token-valido" } };
    const res = createResponseMock();
    const next = vi.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
