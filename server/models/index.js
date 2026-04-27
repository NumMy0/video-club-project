import sequelize from "../config/database.js";
import Socio from "./socio.js";
import Pelicula from "./pelicula.js";
import Copia from "./copia.js";
import Alquiler from "./alquiler.js";

const models = {
  Socio,
  Pelicula,
  Copia,
  Alquiler,
};

Object.values(models).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(models);
  }
});

export { sequelize, Socio, Pelicula, Copia, Alquiler };
export default models;
