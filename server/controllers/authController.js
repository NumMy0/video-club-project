import { login } from "../services/authService.js";

export async function loginController(req, res) {
  try {
    const { identifier, password, role } = req.body ?? {};
    const result = await login({ identifier, password, role });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(401).json({
      message: error.message ?? "No se pudo iniciar sesion",
    });
  }
}

export async function meController(req, res) {
  return res.status(200).json({ user: req.user });
}

export default {
  loginController,
  meController,
};
