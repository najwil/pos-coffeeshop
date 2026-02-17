const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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

// 1. Ambil Profil (PENTING: Agar judul tidak "Loading...")
app.get("/api/profil", (req, res) => {
  const query = "SELECT * FROM profil WHERE id = 1";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0] || { nama_shop: "Nama Belum Set" });
  });
});

// 2. Update Nama Shop
app.put("/api/profil", (req, res) => {
  const { nama_shop } = req.body;
  const query = "UPDATE profil SET nama_shop = ? WHERE id = 1";
  db.query(query, [nama_shop], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Nama Coffee Shop berhasil diubah!" });
  });
});

// --- ENDPOINT MENU ---

// 1. Ambil Semua Menu (Untuk tampil di tabel sebelah kanan)
app.get("/api/menu", (req, res) => {
  const query = "SELECT * FROM menu ORDER BY id DESC"; // DESC agar menu terbaru di atas
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 2. Tambah Menu Baru
app.post("/api/menu", (req, res) => {
  const { nama_item, kategori, harga, stok } = req.body;
  const query =
    "INSERT INTO menu (nama_item, kategori, harga, stok) VALUES (?, ?, ?, ?)";
  db.query(query, [nama_item, kategori, harga, stok], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Menu berhasil ditambahkan!", id: result.insertId });
  });
});

// 3. Hapus Menu
app.delete("/api/menu/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM menu WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Menu berhasil dihapus!" });
  });
});

// 4. Edit Menu
app.put("/api/menu/:id", (req, res) => {
  const { id } = req.params;
  const { nama_item, kategori, harga, stok } = req.body;
  const query =
    "UPDATE menu SET nama_item = ?, kategori = ?, harga = ?, stok = ? WHERE id = ?";
  db.query(query, [nama_item, kategori, harga, stok, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Menu berhasil diperbarui!" });
  });
});

// --- ENDPOINT TRANSAKSI (PROSES PEMBAYARAN) ---
app.post("/api/transaksi", (req, res) => {
  const { total_bayar, metode_pembayaran, items } = req.body;

  // 1. Simpan ke tabel transaksi (Induk)
  const sqlTransaksi =
    "INSERT INTO transaksi (total_bayar, metode_pembayaran) VALUES (?, ?)";

  db.query(sqlTransaksi, [total_bayar, metode_pembayaran], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Gagal menyimpan transaksi utama: " + err.message });
    }

    // INI KUNCINYA: Mengambil ID yang baru saja dibuat di tabel transaksi
    const idBaru = result.insertId;

    // 2. Siapkan data untuk detail_transaksi (Anak)
    // Kita buat array of array untuk insert sekaligus banyak (bulk insert)
    const valuesDetail = items.map((item) => [
      idBaru, // Menghubungkan ke ID induk
      item.id, // ID Menu
      item.qty, // Jumlah yang dibeli
      item.harga * item.qty, // Subtotal
    ]);

    const sqlDetail =
      "INSERT INTO detail_transaksi (transaksi_id, menu_id, jumlah, subtotal) VALUES ?";

    db.query(sqlDetail, [valuesDetail], (err) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Gagal menyimpan detail transaksi: " + err.message });
      }

      // 3. LOGIKA POTONG STOK: Kurangi stok setiap menu yang dibeli
      items.forEach((item) => {
        const sqlUpdateStok = "UPDATE menu SET stok = stok - ? WHERE id = ?";
        db.query(sqlUpdateStok, [item.qty, item.id]);
      });

      res.json({
        message: "Transaksi Berhasil!",
        transaksi_id: idBaru,
      });
    });
  });
});

// Ambil data laporan transaksi
app.get("/api/laporan", (req, res) => {
  const sql = `
    SELECT 
      t.id, 
      t.tanggal, 
      t.total_bayar, 
      t.metode_pembayaran,
      GROUP_CONCAT(CONCAT(m.nama_item, ' (', dt.jumlah, ')') SEPARATOR ', ') AS rincian
    FROM transaksi t
    JOIN detail_transaksi dt ON t.id = dt.transaksi_id
    JOIN menu m ON dt.menu_id = m.id
    GROUP BY t.id
    ORDER BY t.tanggal DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/", (req, res) => {
  res.send("Server Kasir Coffee Shop aktif!");
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
