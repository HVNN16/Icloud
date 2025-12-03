import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://icloud_user:J02akWT9UxoJAgLxoZyGxDDkzXEEJiNc@dpg-d4kqp7juibrs73flqo4g-a.oregon-postgres.render.com:5432/icloud",
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    console.log("===== 🟢 BẢNG PRODUCTS =====");
    const products = await pool.query("SELECT * FROM products ORDER BY id ASC");
    console.table(products.rows);

    console.log("\n===== 🟢 BẢNG USERS =====");
    const users = await pool.query("SELECT id, username, role FROM users ORDER BY id ASC");
    console.table(users.rows);

  } catch (err) {
    console.error("❌ Lỗi truy vấn:", err);
  } finally {
    pool.end();
  }
})();
