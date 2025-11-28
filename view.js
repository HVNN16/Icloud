import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://icloud_user:J02akWT9UxoJAgLxoZyGxDDkzXEEJiNc@dpg-d4kqp7juibrs73flqo4g-a.oregon-postgres.render.com:5432/icloud",
  ssl: { rejectUnauthorized: false }
});

(async () => {
  const result = await pool.query("SELECT * FROM products");
  console.table(result.rows);
  pool.end();
})();
