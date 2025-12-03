import pool from "./db.js";
import bcrypt from "bcrypt";

export async function initDatabase() {
  try {
    console.log("🚀 Đang kiểm tra & tạo bảng...");

    // ================= USERS TABLE =================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(10) NOT NULL CHECK (role IN ('admin', 'user'))
      );
    `);

    // ================= PRODUCTS TABLE =================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price NUMERIC(15,2) NOT NULL
      );
    `);

    console.log("✅ Bảng users & products đã sẵn sàng.");

    // ================= TẠO ADMIN MẶC ĐỊNH =================
    const adminUser = "admin";
    const adminPassword = "admin123";

    const hash = await bcrypt.hash(adminPassword, 10);

    await pool.query(
      `INSERT INTO users (username, password, role)
       VALUES ($1, $2, 'admin')
       ON CONFLICT (username) DO NOTHING`,
       [adminUser, hash]
    );

    console.log("👑 Tài khoản admin đã tồn tại hoặc được tạo mới.");
    console.log("➡ Đăng nhập: admin / admin123");

  } catch (err) {
    console.error("❌ Lỗi initDatabase:", err);
  }
}
