import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class Socio extends Model {
  static associate(models) {
    Socio.hasMany(models.Alquiler, {
      foreignKey: "dni_socio",
      sourceKey: "dni",
      as: "alquileres",
    });
  }
}

Socio.init(
  {
    dni: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      allowNull: false,
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    direccion: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    estado_cuenta: {
      type: DataTypes.ENUM("Activo", "Deudor"),
      allowNull: false,
      defaultValue: "Activo",
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Socio",
    tableName: "socios",
    timestamps: true,
    createdAt: "creado_en",
    updatedAt: "actualizado_en",
  },
);

export default Socio;
