import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME ?? "cinemateca",
  process.env.DB_USER ?? "root",
  process.env.DB_PASSWORD ?? "santilol2234",
  {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 3306),
    dialect: "mysql",
    logging: process.env.NODE_ENV === "production" ? false : console.log,
    define: {
      underscored: true,
      freezeTableName: true,
      timestamps: true,
      createdAt: "creado_en",
      updatedAt: "actualizado_en",
    },
    timezone: "-05:00",
    dialectOptions: {
      decimalNumbers: true,
    },
  },
);

export default sequelize;
