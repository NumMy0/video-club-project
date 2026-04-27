import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class Pelicula extends Model {
  static associate(models) {
    Pelicula.hasMany(models.Copia, {
      foreignKey: "id_pelicula",
      sourceKey: "id_pelicula",
      as: "copias",
    });
  }
}

Pelicula.init(
  {
    id_pelicula: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    titulo: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    genero: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    anio: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    clasificacion: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Pelicula",
    tableName: "peliculas",
    timestamps: true,
    createdAt: "creado_en",
    updatedAt: "actualizado_en",
  },
);

export default Pelicula;
