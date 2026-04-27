import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "cambia-este-secreto";

function normalizeRoles(requiredRoles) {
  if (!requiredRoles) {
    return [];
  }

  return Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
}

function auth(requiredRoles = []) {
  const rolesPermitidos = normalizeRoles(requiredRoles);

  return (req, res, next) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    const token = authorizationHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;

      const rolUsuario = decoded.rol ?? decoded.role;

      if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(rolUsuario)) {
        return res
          .status(403)
          .json({ message: "No tiene permisos para acceder a este recurso" });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: "Token inválido o expirado" });
    }
  };
}

export default auth;
export { auth };
