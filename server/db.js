import mysql from "mysql2/promise";

// Pool tuned for up to 50 concurrent users/connections.
const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "cinemateca",
  waitForConnections: true,
  connectionLimit: 50,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export async function testDbConnection() {
  const connection = await pool.getConnection();

  try {
    await connection.ping();
    console.log("MariaDB connection established successfully.");
  } finally {
    connection.release();
  }
}

export default pool;
