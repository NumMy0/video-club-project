import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class Copia extends Model {
  static associate(models) {
    Copia.belongsTo(models.Pelicula, {
      foreignKey: "id_pelicula",
      targetKey: "id_pelicula",
      as: "pelicula",
    });
  }
}

Copia.init(
  {
    id_copia: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    id_pelicula: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    formato: {
      type: DataTypes.ENUM("DVD", "Blu-ray"),
      allowNull: false,
    },
    estado_copia: {
      type: DataTypes.ENUM(
        "Disponible",
        "Alquilada",
        "Reservada",
        "Reparacion",
      ),
      allowNull: false,
      defaultValue: "Disponible",
    },
    codigo_barra: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Copia",
    tableName: "copias",
    timestamps: true,
    createdAt: "creado_en",
    updatedAt: "actualizado_en",
  },
);

export default Copia;
