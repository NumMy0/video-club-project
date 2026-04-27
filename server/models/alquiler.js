import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class Alquiler extends Model {
  static associate(models) {
    Alquiler.belongsTo(models.Socio, {
      foreignKey: "dni_socio",
      targetKey: "dni",
      as: "socio",
    });

    Alquiler.belongsTo(models.Copia, {
      foreignKey: "id_copia",
      targetKey: "id_copia",
      as: "copia",
    });
  }
}

Alquiler.init(
  {
    id_alquiler: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    dni_socio: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    id_copia: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    fecha_salida: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    fecha_limite: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fecha_retorno: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    observaciones: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Alquiler",
    tableName: "alquileres",
    timestamps: true,
    createdAt: "creado_en",
    updatedAt: "actualizado_en",
  },
);

export default Alquiler;
