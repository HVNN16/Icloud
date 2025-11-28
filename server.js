// import express from "express";
// import dotenv from "dotenv";
// import pool from "./db.js";
// import path from "path";

// dotenv.config();
// const app = express();
// const __dirname = path.resolve();

// app.use(express.urlencoded({ extended: true }));
// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));


// // 🔍 DEBUG — kiểm tra DB
// app.get("/debug", async (req, res) => {
//   try {
//     const [rows] = await pool.query("SHOW TABLES");
//     res.json(rows);
//   } catch (err) {
//     res.send(err);
//   }
// });


// app.get("/", (req, res) => {
//   res.redirect("/products");
// });

// // Trang thêm sản phẩm (GET)
// app.get("/add", (req, res) => {
//   res.render("index", {
//     success: req.query.success,
//     error: req.query.error
//   });
// });

// // Thêm sản phẩm
// app.post("/add", async (req, res) => {
//   try {
//     const { name, price } = req.body;
//     await pool.query(
//       "INSERT INTO products (name, price) VALUES (?, ?)",
//       [name, price]
//     );
//     res.redirect("/products?success=1");
//   } catch (err) {
//     console.error("❌ Lỗi thêm:", err);
//     res.redirect("/?error=1");
//   }
// });


// // Danh sách
// app.get("/products", async (req, res) => {
//   try {
//     const [rows] = await pool.query("SELECT * FROM products ORDER BY id ASC");
//     res.render("products", { products: rows, success: req.query.success });
//   } catch (err) {
//     console.error("❌ Lỗi load:", err);
//     res.render("products", { products: [], success: 0 });
//   }
// });


// // Xóa
// app.post("/delete/:id", async (req, res) => {
//   try {
//     await pool.query("DELETE FROM products WHERE id = ?", [req.params.id]);

//     const [[{ total }]] = await pool.query(
//       "SELECT COUNT(*) AS total FROM products"
//     );

//     if (total === 0) {
//       await pool.query("ALTER TABLE products AUTO_INCREMENT = 1");
//     }

//     res.redirect("/products?success=1");
//   } catch (err) {
//     res.redirect("/products?error=1");
//   }
// });


// // Form sửa
// app.get("/edit/:id", async (req, res) => {
//   try {
//     const [rows] = await pool.query(
//       "SELECT * FROM products WHERE id = ?",
//       [req.params.id]
//     );

//     if (rows.length === 0) return res.send("❌ Không có!");

//     res.render("edit", { product: rows[0] });
//   } catch (err) {
//     res.send("❌ Lỗi!");
//   }
// });


// // Cập nhật
// app.post("/edit/:id", async (req, res) => {
//   try {
//     const { name, price } = req.body;

//     await pool.query(
//       "UPDATE products SET name=?, price=? WHERE id=?",
//       [name, price, req.params.id]
//     );

//     res.redirect("/products?success=1");
//   } catch (err) {
//     res.send("❌ Lỗi cập nhật!");
//   }
// });


// // Tìm kiếm
// app.get("/search", async (req, res) => {
//   if (!req.query.keyword)
//     return res.render("search", { products: [], searched: false });

//   try {
//     const [rows] = await pool.query(
//       "SELECT * FROM products WHERE name LIKE ?",
//       [`%${req.query.keyword}%`]
//     );

//     res.render("search", { products: rows, searched: true });
//   } catch (err) {
//     res.send("❌ Lỗi tìm kiếm!");
//   }
// });


// // Server
// const PORT = process.env.PORT || 8080;
// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`🚀 Server chạy tại ${PORT}`);
// });

import express from "express";
import dotenv from "dotenv";
import pool from "./db.js";   // pg pool
import path from "path";

dotenv.config();
const app = express();
const __dirname = path.resolve();

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// 🔍 DEBUG
app.get("/debug", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
    );
    res.json(result.rows);
  } catch (err) {
    res.send(err);
  }
});


app.get("/", (req, res) => {
  res.redirect("/products");
});


// Form thêm sản phẩm
app.get("/add", (req, res) => {
  res.render("index", {
    success: req.query.success,
    error: req.query.error
  });
});


// Thêm sản phẩm
app.post("/add", async (req, res) => {
  try {
    const { name, price } = req.body;

    await pool.query(
      "INSERT INTO products (name, price) VALUES ($1, $2)",
      [name, price]
    );

    res.redirect("/products?success=1");
  } catch (err) {
    console.error("❌ Lỗi thêm:", err);
    res.redirect("/add?error=1");
  }
});


// Danh sách
app.get("/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY id ASC");
    res.render("products", {
      products: result.rows,
      success: req.query.success
    });

  } catch (err) {
    console.error("❌ Lỗi load:", err);
    res.render("products", { products: [], success: 0 });
  }
});


// Xóa sản phẩm
app.post("/delete/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM products WHERE id=$1", [req.params.id]);
    res.redirect("/products?success=1");

  } catch (err) {
    console.error(err);
    res.redirect("/products?error=1");
  }
});


// Form sửa
app.get("/edit/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE id=$1",
      [req.params.id]
    );

    if (result.rows.length === 0)
      return res.send("❌ Không tìm thấy sản phẩm!");

    res.render("edit", { product: result.rows[0] });

  } catch (err) {
    res.send("❌ Lỗi!");
  }
});


// Cập nhật sản phẩm
app.post("/edit/:id", async (req, res) => {
  try {
    const { name, price } = req.body;

    await pool.query(
      "UPDATE products SET name=$1, price=$2 WHERE id=$3",
      [name, price, req.params.id]
    );

    res.redirect("/products?success=1");

  } catch (err) {
    res.send("❌ Lỗi cập nhật!");
  }
});


// Tìm kiếm
app.get("/search", async (req, res) => {
  if (!req.query.keyword)
    return res.render("search", { products: [], searched: false });

  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE name ILIKE $1",
      [`%${req.query.keyword}%`]
    );

    res.render("search", {
      products: result.rows,
      searched: true
    });

  } catch (err) {
    res.send("❌ Lỗi tìm kiếm!");
  }
});


// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server chạy tại ${PORT}`);
});
