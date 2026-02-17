const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- KONFIGURASI MULTER (UNTUK UPLOAD GAMBAR) ---
// Memastikan folder 'uploads' ada, jika tidak ada maka dibuat otomatis
const dir = "./uploads";
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Nama file unik: timestamp + ekstensi asli
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2000000 }, // Batas 2MB
});

// Menyediakan folder uploads sebagai statis agar bisa diakses lewat URL
app.use("/uploads", express.static("uploads"));

// Konfigurasi Koneksi Database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_coffeeshop",
});

db.connect((err) => {
  if (err) {
    console.error("Koneksi database GAGAL: " + err.stack);
    return;
  }
  console.log("Berhasil terhubung ke database MySQL.");
});

// --- ENDPOINT PROFIL (Toko) ---

app.get("/api/profil", (req, res) => {
  const query = "SELECT * FROM profil WHERE id = 1";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(
      results[0] || {
        nama_shop: "Nama Belum Set",
        owner: "-",
        alamat: "-",
      },
    );
  });
});

app.put("/api/profil", (req, res) => {
  const { nama_shop, owner, alamat } = req.body;
  const query =
    "UPDATE profil SET nama_shop = ?, owner = ?, alamat = ? WHERE id = 1";

  db.query(query, [nama_shop, owner, alamat], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Profil Coffee Shop berhasil diperbarui!" });
  });
});

// --- ENDPOINT MENU ---

app.get("/api/menu", (req, res) => {
  const query = "SELECT * FROM menu ORDER BY id DESC";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// UPDATE: Ditambahkan upload.single('gambar')
app.post("/api/menu", upload.single("gambar"), (req, res) => {
  const { nama_item, kategori, harga, stok } = req.body;
  const gambar = req.file ? req.file.filename : null; // Simpan nama file jika ada

  const query =
    "INSERT INTO menu (nama_item, kategori, harga, stok, gambar) VALUES (?, ?, ?, ?, ?)";
  db.query(query, [nama_item, kategori, harga, stok, gambar], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Menu berhasil ditambahkan!", id: result.insertId });
  });
});

app.delete("/api/menu/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM menu WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Menu berhasil dihapus!" });
  });
});

// UPDATE: Mendukung update gambar pada menu
app.put("/api/menu/:id", upload.single("gambar"), (req, res) => {
  const { id } = req.params;
  const { nama_item, kategori, harga, stok } = req.body;

  let query;
  let params;

  if (req.file) {
    // Jika ada upload gambar baru
    query =
      "UPDATE menu SET nama_item = ?, kategori = ?, harga = ?, stok = ?, gambar = ? WHERE id = ?";
    params = [nama_item, kategori, harga, stok, req.file.filename, id];
  } else {
    // Jika tidak ada gambar baru yang diupload
    query =
      "UPDATE menu SET nama_item = ?, kategori = ?, harga = ?, stok = ? WHERE id = ?";
    params = [nama_item, kategori, harga, stok, id];
  }

  db.query(query, params, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Menu berhasil diperbarui!" });
  });
});

// --- ENDPOINT TRANSAKSI ---

app.post("/api/transaksi", (req, res) => {
  const { total_bayar, metode_pembayaran, items } = req.body;
  const sqlTransaksi =
    "INSERT INTO transaksi (total_bayar, metode_pembayaran) VALUES (?, ?)";

  db.query(sqlTransaksi, [total_bayar, metode_pembayaran], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    const idBaru = result.insertId;
    const valuesDetail = items.map((item) => [
      idBaru,
      item.id,
      item.qty,
      item.harga * item.qty,
    ]);

    const sqlDetail =
      "INSERT INTO detail_transaksi (transaksi_id, menu_id, jumlah, subtotal) VALUES ?";

    db.query(sqlDetail, [valuesDetail], (err) => {
      if (err) return res.status(500).json({ error: err.message });

      items.forEach((item) => {
        const sqlUpdateStok = "UPDATE menu SET stok = stok - ? WHERE id = ?";
        db.query(sqlUpdateStok, [item.qty, item.id]);
      });

      res.json({ message: "Transaksi Berhasil!", transaksi_id: idBaru });
    });
  });
});

app.get("/api/laporan", (req, res) => {
  const sql = `
    SELECT 
      t.id, 
      t.tanggal, 
      t.total_bayar, 
      t.metode_pembayaran,
      GROUP_CONCAT(CONCAT(m.nama_item, ' (', dt.jumlah, ')') SEPARATOR ', ') AS rincian
    FROM transaksi t
    LEFT JOIN detail_transaksi dt ON t.id = dt.transaksi_id
    LEFT JOIN menu m ON dt.menu_id = m.id
    GROUP BY t.id
    ORDER BY t.tanggal DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.delete("/api/transaksi/:id", (req, res) => {
  const { id } = req.params;
  const sqlHapusDetail = "DELETE FROM detail_transaksi WHERE transaksi_id = ?";

  db.query(sqlHapusDetail, [id], (err) => {
    if (err)
      return res
        .status(500)
        .json({ error: "Gagal hapus detail: " + err.message });

    const sqlHapusTransaksi = "DELETE FROM transaksi WHERE id = ?";
    db.query(sqlHapusTransaksi, [id], (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ error: "Gagal hapus transaksi: " + err.message });
      res.json({ message: "Transaksi berhasil dihapus dari laporan!" });
    });
  });
});

app.get("/", (req, res) => {
  res.send("Server Kasir Coffee Shop aktif!");
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
