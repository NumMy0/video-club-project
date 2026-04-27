import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const DB_HOST = process.env.DB_HOST ?? "localhost";
const DB_USER = process.env.DB_USER ?? "root";
const DB_PASSWORD = process.env.DB_PASSWORD ?? "santilol2234";
const DB_NAME = process.env.DB_NAME ?? "cinemateca";

async function runSqlFile(connection, filePath) {
  const sql = await fs.readFile(filePath, "utf8");
  await connection.query(sql);
}

async function main() {
  const databaseSchemaPath = path.join(projectRoot, "database.sql");
  const seedDataPath = path.join(projectRoot, "insert_test_data.sql");

  const connection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    multipleStatements: true,
  });

  try {
    console.log(`Recreando base de datos ${DB_NAME}...`);
    await connection.query(`DROP DATABASE IF EXISTS ${DB_NAME}`);

    console.log("Aplicando esquema de base de datos...");
    await runSqlFile(connection, databaseSchemaPath);

    console.log("Insertando datos de prueba...");
    await runSqlFile(connection, seedDataPath);

    console.log("Base de datos lista: esquema + datos de prueba aplicados.");
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error("Error al preparar la base de datos:", error);
  process.exit(1);
});
