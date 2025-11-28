// test-conn.js
import mysql from "mysql2";

const conn = mysql.createConnection({
  host: "switchback.proxy.rlwy.net",
  user: "root",
  password: "FxQTAuQbJjCLkvOYUbYoZylFCDSvhcAz", // 🔐 Mật khẩu thật từ Railway
  database: "railway",
  port: 52624,
});

conn.connect((err) => {
  if (err) {
    console.error("❌ Lỗi kết nối MySQL:", err);
  } else {
    console.log("✅ Đã kết nối MySQL thành công!");
  }
  conn.end();
});
