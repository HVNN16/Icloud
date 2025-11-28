import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test connection
(async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ PostgreSQL Connected!", res.rows[0]);
  } catch (err) {
    console.error("❌ Lỗi kết nối PostgreSQL:", err);
  }
})();

export default pool;   // 👈 THÊM DÒNG NÀY
