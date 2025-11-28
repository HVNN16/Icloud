import pkg from "pg";

const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://icloud_user:J02akWT9UxoJAgLxoZyGxDDkzXEEJiNc@dpg-d4kqp7juibrs73flqo4g-a.oregon-postgres.render.com:5432/icloud",
  ssl: { rejectUnauthorized: false }
});

const sql = `
DROP TABLE IF EXISTS products;

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(10,3)
);

INSERT INTO products (id, name, price) VALUES
(1,'Bàn học sinh gỗ thông',350000),
(2,'Ghế nhựa tựa lưng học sinh',120000),
(3,'Bàn học có ngăn kéo',550000),
(4,'Kệ sách mini 3 tầng',180000),
(5,'Tủ sách nhựa 5 ngăn',420000),
(6,'Vở ô ly 96 trang',12000),
(7,'Vở kẻ ngang 200 trang',18000),
(8,'Sổ tay cá nhân bìa cứng A5',25000),
(9,'Giấy note màu 3x3',9000),
(10,'Giấy kiểm tra A4',6000),
(11,'Bút bi xanh Thiên Long',5000),
(12,'Bút chì gỗ 2B',4000),
(13,'Bút máy luyện chữ đẹp',35000),
(14,'Bút highlight 6 màu',45000),
(15,'Thước kẻ nhựa 20cm',8000),
(16,'Hộp bút nhựa học sinh',30000),
(17,'Ba lô học sinh cấp 2',180000),
(18,'Compa vẽ học tập',15000),
(19,'Tập giấy vẽ mỹ thuật A3',22000),
(20,'Hộp màu sáp 24 màu',35000);
`;

(async () => {
  try {
    await pool.query(sql);
    console.log("🎉 IMPORT THÀNH CÔNG!");
  } catch (err) {
    console.error("❌ lỗi:", err);
  } finally {
    pool.end();
  }
})();
