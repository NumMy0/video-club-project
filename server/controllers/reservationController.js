import {
  crearReserva,
  getHistorialSocio,
} from "../services/reservationService.js";

export async function crearReservaController(req, res) {
  console.log("[reservationController] body", req.body);
  console.log("[reservationController] user", req.user);

  try {
    const { id_copia, id_pelicula, fecha_limite, observaciones, dni_socio } =
      req.body ?? {};

    if (!id_copia && !id_pelicula) {
      return res
        .status(400)
        .json({ message: "id_copia o id_pelicula es obligatorio" });
    }

    const esSocio = req.user?.rol === "Socio";
    const dniSocio = esSocio ? req.user.dni : dni_socio;

    if (!dniSocio) {
      return res.status(400).json({ message: "dni_socio es obligatorio" });
    }

    const reserva = await crearReserva({
      idCopia: id_copia ? Number(id_copia) : null,
      idPelicula: id_pelicula ? Number(id_pelicula) : null,
      dniSocio,
      fechaLimite: fecha_limite,
      idUsuario: req.user?.id_usuario,
      observaciones,
    });

    return res.status(201).json({
      message: "Reserva creada correctamente",
      data: reserva,
    });
  } catch (error) {
    console.error("[reservationController] error", error);
    const status = /disponible|habilitado|encontrada/i.test(error.message)
      ? 409
      : 500;

    return res.status(status).json({
      message: error.message ?? "No se pudo crear la reserva",
    });
  }
}

export async function historialSocioController(req, res) {
  try {
    const dni = req.user?.dni;

    if (!dni) {
      return res.status(400).json({ message: "Sesion de socio invalida" });
    }

    const data = await getHistorialSocio(dni);

    return res.status(200).json({ data });
  } catch (_error) {
    return res.status(500).json({
      message: "No se pudo obtener el historial",
    });
  }
}

export default {
  crearReservaController,
  historialSocioController,
};
