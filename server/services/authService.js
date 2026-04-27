import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sequelize from "../config/database.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "cambia-este-secreto";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "8h";

function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export async function login({ identifier, password, role }) {
  if (!identifier || !password) {
    throw new Error("Credenciales incompletas");
  }

  if (role === "Socio") {
    const [rows] = await sequelize.query(
      `
      SELECT dni, nombre, estado_cuenta, email
      FROM socios
      WHERE dni = :dni
      LIMIT 1
      `,
      {
        replacements: { dni: identifier },
      },
    );

    const socio = rows[0];

    if (!socio || socio.estado_cuenta === "Deudor") {
      throw new Error("Credenciales invalidas");
    }

    // MVP: para socio se usa el DNI como clave inicial.
    if (password !== socio.dni) {
      throw new Error("Credenciales invalidas");
    }

    const user = {
      rol: "Socio",
      dni: socio.dni,
      nombre: socio.nombre,
      email: socio.email,
    };

    return {
      token: createToken(user),
      user,
    };
  }

  const [rows] = await sequelize.query(
    `
    SELECT id_usuario, nombre, usuario, contrasena_hash, rol, activo
    FROM usuarios
    WHERE usuario = :usuario
    LIMIT 1
    `,
    {
      replacements: { usuario: identifier },
    },
  );

  const usuario = rows[0];

  if (!usuario || !usuario.activo) {
    throw new Error("Credenciales invalidas");
  }

  const passwordOk = await bcrypt.compare(password, usuario.contrasena_hash);

  if (!passwordOk) {
    throw new Error("Credenciales invalidas");
  }

  const user = {
    rol: usuario.rol,
    id_usuario: usuario.id_usuario,
    usuario: usuario.usuario,
    nombre: usuario.nombre,
  };

  return {
    token: createToken(user),
    user,
  };
}

export default {
  login,
};
