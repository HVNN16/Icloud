import express from "express";
import dotenv from "dotenv";
import pool from "./db.js";   
import path from "path";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

dotenv.config();
const app = express();
const __dirname = path.resolve();

const SECRET = process.env.JWT_SECRET;

// ========================================================
// 🔥 TỰ ĐỘNG TẠO BẢNG & ADMIN MẶC ĐỊNH
// ========================================================
async function initDatabase() {
  try {
    console.log("🔄 Kiểm tra & tạo bảng...");

    // Bảng users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(10) NOT NULL CHECK (role IN ('admin', 'user'))
      );
    `);

    // Bảng products
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price NUMERIC(15,2) NOT NULL
      );
    `);

    // Admin mặc định
    const admin = await pool.query(
      "SELECT * FROM users WHERE username = 'admin'"
    );

    if (admin.rows.length === 0) {
      const hash = await bcrypt.hash("admin123", 10);
      await pool.query(
        "INSERT INTO users (username, password, role) VALUES ($1, $2, 'admin')",
        ["admin", hash]
      );
      console.log("👑 Admin mặc định đã được tạo (admin / admin123)");
    }

    console.log("✅ Database đã sẵn sàng!");

  } catch (err) {
    console.error("❌ Database Error:", err);
  }
}


// ========================================================
// MIDDLEWARE
// ========================================================
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// Giải mã token
app.use((req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    req.user = null;
    res.locals.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;      
    res.locals.user = decoded;
  } catch (err) {
    req.user = null;
    res.locals.user = null;
  }

  next();
});


// Kiểm tra login
function verifyLogin(req, res, next) {
  if (!req.user) return res.redirect("/login");
  next();
}

// Kiểm tra admin
function verifyAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin")
    return res.send("❌ Bạn không có quyền truy cập!");
  next();
}


// ========================================================
// 🔐 AUTH
// ========================================================

// Form đăng ký
app.get("/register", (req, res) => {
  res.render("register");
});

// Xử lý đăng ký
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const hash = await bcrypt.hash(password, 10);
  const role = "user"; // ÉP CỨNG ROLE USER

  await pool.query(
    "INSERT INTO users (username, password, role) VALUES ($1, $2, $3)",
    [username, hash, role]
  );

  res.redirect("/login");
});


// Form đăng nhập
app.get("/login", (req, res) => {
  res.render("login");
});

// Xử lý đăng nhập
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const result = await pool.query(
    "SELECT * FROM users WHERE username=$1",
    [username]
  );

  if (result.rows.length === 0)
    return res.send("❌ Sai tài khoản!");

  const user = result.rows[0];

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.send("❌ Sai mật khẩu!");

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("token", token, { httpOnly: true });
  res.redirect("/products");
});


// Đăng xuất
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});


// ========================================================
// 🛒 SẢN PHẨM
// ========================================================

// Trang chủ
app.get("/", (req, res) => {
  res.redirect("/products");
});

// Form thêm sản phẩm (admin)
app.get("/add", verifyLogin, verifyAdmin, (req, res) => {
  res.render("index", {
    success: req.query.success,
    error: req.query.error
  });
});

// Thêm sản phẩm
app.post("/add", verifyLogin, verifyAdmin, async (req, res) => {
  try {
    const { name, price } = req.body;

    await pool.query(
      "INSERT INTO products (name, price) VALUES ($1, $2)",
      [name, price]
    );

    res.redirect("/products?success=1");
  } catch (err) {
    res.redirect("/add?error=1");
  }
});

// Danh sách sản phẩm
app.get("/products", verifyLogin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY id ASC");

    res.render("products", {
      products: result.rows,
      success: req.query.success
    });

  } catch (err) {
    res.render("products", { products: [], success: 0 });
  }
});


// Xóa sản phẩm (admin)
app.post("/delete/:id", verifyLogin, verifyAdmin, async (req, res) => {
  await pool.query("DELETE FROM products WHERE id=$1", [req.params.id]);
  res.redirect("/products?success=1");
});

// Form sửa sản phẩm
app.get("/edit/:id", verifyLogin, verifyAdmin, async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM products WHERE id=$1",
    [req.params.id]
  );

  if (result.rows.length === 0)
    return res.send("❌ Không tìm thấy sản phẩm!");

  res.render("edit", { product: result.rows[0] });
});

// Cập nhật sản phẩm
app.post("/edit/:id", verifyLogin, verifyAdmin, async (req, res) => {
  const { name, price } = req.body;

  await pool.query(
    "UPDATE products SET name=$1, price=$2 WHERE id=$3",
    [name, price, req.params.id]
  );

  res.redirect("/products?success=1");
});


// Tìm kiếm
app.get("/search", verifyLogin, async (req, res) => {
  if (!req.query.keyword)
    return res.render("search", { products: [], searched: false });

  const result = await pool.query(
    "SELECT * FROM products WHERE name ILIKE $1",
    [`%${req.query.keyword}%`]
  );

  res.render("search", {
    products: result.rows,
    searched: true
  });
});


// ========================================================
// START SERVER
// ========================================================
const PORT = process.env.PORT || 3000;

initDatabase().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server chạy tại ${PORT}`);
  });
});
