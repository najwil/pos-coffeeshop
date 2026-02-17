import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import Navbar from "./components/navbar";
import Dashboard from "./components/dashboard";
import Admin from "./components/admin";
import Kasir from "./components/kasir";
import Laporan from "./components/laporan";

function App() {
  // --- STATE AUTH & NAVIGASI ---
  const [isLogin, setIsLogin] = useState(false);
  const [halaman, setHalaman] = useState("dashboard");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // --- STATE DATA UTAMA ---
  const [namaShop, setNamaShop] = useState("Loading...");
  const [daftarMenu, setDaftarMenu] = useState([]);
  const [laporan, setLaporan] = useState([]);

  // --- STATE PROFIL ---
  const [dataProfil, setDataProfil] = useState({
    id: 1,
    nama_shop: "",
    owner: "",
    alamat: "",
    username: "admin",
    password: "",
  });
  const [showModalEditProfil, setShowModalEditProfil] = useState(false);
  const [inputProfil, setInputProfil] = useState({ ...dataProfil });

  // --- STATE PENCARIAN & SORTING ---
  const [cariMenu, setCariMenu] = useState("");
  const [filterKategori, setFilterKategori] = useState("Semua");
  const [filterTanggal, setFilterTanggal] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "nama_item",
    direction: "asc",
  });

  // --- STATE TRANSAKSI ---
  const [keranjang, setKeranjang] = useState([]);
  const [metodeBayar, setMetodeBayar] = useState("Tunai");
  const [uangDiterima, setUangDiterima] = useState(0);
  const [showModalNota, setShowModalNota] = useState(false);
  const [dataNota, setDataNota] = useState(null);

  // --- STATE CRUD MENU ---
  const [namaItem, setNamaItem] = useState("");
  const [kategoriInput, setKategoriInput] = useState("makanan");
  const [harga, setHarga] = useState("");
  const [stok, setStok] = useState(0);
  const [fileGambar, setFileGambar] = useState(null);
  const [menuDipilih, setMenuDipilih] = useState(null);
  const [showModalEdit, setShowModalEdit] = useState(false);

  // MODAL HAPUS
  const [showModalHapus, setShowModalHapus] = useState(false);
  const [dataHapus, setDataHapus] = useState({
    id: null,
    tipe: "menu",
    nama: "",
  });

  // NOTIFIKASI
  const [notif, setNotif] = useState({
    show: false,
    pesan: "",
    tipe: "success",
  });

  const tampilNotif = (pesan, tipe = "success") => {
    setNotif({ show: true, pesan, tipe });
    setTimeout(
      () => setNotif({ show: false, pesan: "", tipe: "success" }),
      3000,
    );
  };

  // --- FUNGSI KOMPRESI GAMBAR ---
  const resizeImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 400;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(
            (blob) => {
              resolve(blob);
            },
            "image/webp",
            0.7,
          );
        };
      };
    });
  };

  const ambilData = async () => {
    try {
      const resProfil = await axios.get("http://localhost:5000/api/profil");
      const profilFetched = resProfil.data;
      setDataProfil((prev) => ({ ...prev, ...profilFetched }));
      setNamaShop(profilFetched.nama_shop);

      const resMenu = await axios.get("http://localhost:5000/api/menu");
      setDaftarMenu(resMenu.data);

      const resLaporan = await axios.get("http://localhost:5000/api/laporan");
      setLaporan(
        resLaporan.data.map((i) => ({
          ...i,
          total_bayar: Number(i.total_bayar),
        })),
      );
    } catch (error) {
      console.error("Gagal ambil data");
    }
  };

  useEffect(() => {
    ambilData();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "123") {
      setIsLogin(true);
      tampilNotif("Selamat Datang Kembali!", "success");
    } else {
      tampilNotif("Akses Ditolak: Cek Username/Password", "danger");
    }
  };

  const handleUpdateProfil = async () => {
    try {
      await axios.put("http://localhost:5000/api/profil", {
        nama_shop: inputProfil.nama_shop,
        owner: inputProfil.owner,
        alamat: inputProfil.alamat,
      });
      setDataProfil(inputProfil);
      setNamaShop(inputProfil.nama_shop);
      setShowModalEditProfil(false);
      tampilNotif("Profil Toko Berhasil Diperbarui!");
    } catch (e) {
      tampilNotif("Gagal update profil", "danger");
    }
  };

  // --- FUNGSI TAMBAH MENU DENGAN VALIDASI & KOMPRESI ---
  const handleTambahMenu = async (e) => {
    e.preventDefault();

    // VALIDASI UKURAN FILE (Contoh: Max 2MB)
    if (fileGambar && fileGambar.size > 2 * 1024 * 1024) {
      return tampilNotif(
        "Ukuran gambar terlalu besar! Maksimal 2MB.",
        "danger",
      );
    }

    const formData = new FormData();
    formData.append("nama_item", namaItem);
    formData.append("kategori", kategoriInput);
    formData.append("harga", harga);
    formData.append("stok", stok);

    try {
      if (fileGambar) {
        const compressedFile = await resizeImage(fileGambar);
        formData.append("gambar", compressedFile, "menu-image.webp");
      }

      await axios.post("http://localhost:5000/api/menu", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      tampilNotif("Menu berhasil ditambahkan!");
      setNamaItem("");
      setHarga("");
      setStok(0);
      setFileGambar(null);
      ambilData();
    } catch (err) {
      tampilNotif("Gagal tambah menu", "danger");
    }
  };

  const eksekusiHapus = async () => {
    try {
      const url =
        dataHapus.tipe === "menu"
          ? `http://localhost:5000/api/menu/${dataHapus.id}`
          : `http://localhost:5000/api/transaksi/${dataHapus.id}`;

      await axios.delete(url);
      setShowModalHapus(false);
      ambilData();
      tampilNotif(`Data ${dataHapus.tipe} berhasil dihapus`, "warning");
    } catch (error) {
      tampilNotif("Gagal menghapus data", "danger");
    }
  };

  const updateQtyKeranjang = (id, delta) => {
    setKeranjang(
      keranjang.map((item) => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          const menuAsli = daftarMenu.find((m) => m.id === id);
          if (newQty > menuAsli.stok) {
            tampilNotif("Stok tidak cukup", "warning");
            return item;
          }
          return newQty > 0 ? { ...item, qty: newQty } : item;
        }
        return item;
      }),
    );
  };

  const tambahKeKeranjang = (menu) => {
    if (menu.stok <= 0) return tampilNotif("Stok habis!", "danger");
    const ada = keranjang.find((i) => i.id === menu.id);
    if (ada) {
      updateQtyKeranjang(menu.id, 1);
    } else {
      setKeranjang([...keranjang, { ...menu, qty: 1 }]);
    }
  };

  const hitungTotal = () =>
    keranjang.reduce((total, item) => total + Number(item.harga) * item.qty, 0);

  const previewNota = () => {
    const total = hitungTotal();
    if (metodeBayar === "Tunai" && uangDiterima < total)
      return tampilNotif("Uang pembayaran kurang!", "danger");
    setDataNota({
      isNew: true,
      items: [...keranjang],
      total,
      bayar: metodeBayar === "Tunai" ? uangDiterima : total,
      kembalian: metodeBayar === "Tunai" ? uangDiterima - total : 0,
      metode: metodeBayar,
      tanggal: new Date().toLocaleString("id-ID"),
    });
    setShowModalNota(true);
  };

  const simpanTransaksi = async (cetak = false) => {
    try {
      await axios.post("http://localhost:5000/api/transaksi", {
        total_bayar: dataNota.total,
        metode_pembayaran: dataNota.metode,
        items: dataNota.items,
      });
      if (cetak) window.print();
      tampilNotif("Transaksi Berhasil Disimpan!");
      setKeranjang([]);
      setUangDiterima(0);
      setShowModalNota(false);
      ambilData();
    } catch (e) {
      tampilNotif("Gagal simpan transaksi", "danger");
    }
  };

  const handleCetakUlang = (trx) => {
    setDataNota({
      isNew: false,
      rincianRaw: trx.rincian,
      total: trx.total_bayar,
      bayar: trx.total_bayar,
      kembalian: 0,
      metode: trx.metode_pembayaran,
      tanggal: new Date(trx.tanggal).toLocaleString("id-ID"),
    });
    setShowModalNota(true);
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  const dapatkanMenuTersaring = () => {
    let tempMenu = [...daftarMenu].filter((item) => {
      const cocokNama = item.nama_item
        .toLowerCase()
        .includes(cariMenu.toLowerCase());
      const cocokKategori =
        filterKategori === "Semua" || item.kategori === filterKategori;
      return cocokNama && cocokKategori;
    });
    return tempMenu.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === "asc" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const ToastNotif = () => (
    <div
      className={`toast-container position-fixed top-0 start-50 translate-middle-x mt-3 no-print ${notif.show ? "show" : ""}`}
      style={{ zIndex: 9999 }}
    >
      <div className={`custom-toast bg-${notif.tipe}`}>
        <div className="toast-content">
          <i
            className={`bi ${notif.tipe === "success" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"} me-2`}
          ></i>
          {notif.pesan}
        </div>
      </div>
    </div>
  );

  if (!isLogin) {
    return (
      <div
        className="container-fluid d-flex justify-content-center align-items-center bg-dark"
        style={{ height: "100vh" }}
      >
        <ToastNotif />
        <div
          className="card p-5 shadow-lg border-0 login-card"
          style={{ width: "400px", borderRadius: "24px" }}
        >
          <div className="text-center mb-4">
            <h2 className="fw-bold text-primary">KAFE KITA</h2>
            <p className="text-muted">Silakan login untuk akses kasir</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="small fw-bold text-secondary">USERNAME</label>
              <input
                type="text"
                className="form-control form-control-lg bg-light border-0"
                placeholder="admin"
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="small fw-bold text-secondary">PASSWORD</label>
              <input
                type="password"
                className="form-control form-control-lg bg-light border-0"
                placeholder="••••••"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="btn btn-primary w-100 fw-bold py-3 shadow-sm rounded-pill">
              LOGIN SEKARANG
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-2 mt-md-4 pb-5">
      <ToastNotif />

      <Navbar
        namaShop={namaShop}
        halaman={halaman}
        setHalaman={setHalaman}
        setIsLogin={setIsLogin}
      />

      {halaman === "dashboard" && (
        <Dashboard namaShop={namaShop} laporan={laporan} />
      )}

      {halaman === "kasir" && (
        <Kasir
          keranjang={keranjang}
          setKeranjang={setKeranjang}
          updateQtyKeranjang={updateQtyKeranjang}
          hitungTotal={hitungTotal}
          metodeBayar={metodeBayar}
          setMetodeBayar={setMetodeBayar}
          uangDiterima={uangDiterima}
          setUangDiterima={setUangDiterima}
          previewNota={previewNota}
          cariMenu={cariMenu}
          setCariMenu={setCariMenu}
          dapatkanMenuTersaring={dapatkanMenuTersaring}
          tambahKeKeranjang={tambahKeKeranjang}
        />
      )}

      {halaman === "admin" && (
        <Admin
          axios={axios}
          namaItem={namaItem}
          setNamaItem={setNamaItem}
          kategoriInput={kategoriInput}
          setKategoriInput={setKategoriInput}
          harga={harga}
          setHarga={setHarga}
          stok={stok}
          setStok={setStok}
          fileGambar={fileGambar}
          setFileGambar={setFileGambar}
          handleTambahMenu={handleTambahMenu}
          ambilData={ambilData}
          tampilNotif={tampilNotif}
          requestSort={requestSort}
          sortConfig={sortConfig}
          dapatkanMenuTersaring={dapatkanMenuTersaring}
          setMenuDipilih={setMenuDipilih}
          setShowModalEdit={setShowModalEdit}
          setShowModalHapus={setShowModalHapus}
          setDataHapus={setDataHapus}
          dataProfil={dataProfil}
          setShowModalEditProfil={(val) => {
            setInputProfil({ ...dataProfil });
            setShowModalEditProfil(val);
          }}
        />
      )}

      {halaman === "laporan" && (
        <Laporan
          laporan={laporan}
          filterTanggal={filterTanggal}
          setFilterTanggal={setFilterTanggal}
          handleCetakUlang={handleCetakUlang}
          ambilData={ambilData}
          tampilNotif={tampilNotif}
          axios={axios}
          setShowModalHapus={setShowModalHapus}
          setDataHapus={setDataHapus}
        />
      )}

      {/* --- MODAL NOTA --- */}
      {showModalNota && dataNota && (
        <div className="modal-overlay">
          <div className="modal-card nota-card">
            <div
              id="area-nota"
              className="p-4 bg-white text-dark font-monospace"
            >
              <div className="text-center border-bottom pb-3 mb-3">
                <h5 className="fw-bold mb-0">{namaShop}</h5>
                <small className="text-muted">{dataNota.tanggal}</small>
              </div>
              <div className="nota-items">
                {dataNota.isNew ? (
                  dataNota.items.map((it, i) => (
                    <div
                      key={i}
                      className="d-flex justify-content-between mb-1 small"
                    >
                      <span>
                        {it.nama_item} x{it.qty}
                      </span>
                      <span>{Number(it.harga * it.qty).toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <div className="small mb-3">{dataNota.rincianRaw}</div>
                )}
              </div>
              <div className="border-top pt-3 mt-3">
                <div className="d-flex justify-content-between fw-bold">
                  <span>TOTAL</span>
                  <span>Rp {dataNota.total.toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between small text-secondary">
                  <span>Bayar ({dataNota.metode})</span>
                  <span>{dataNota.bayar.toLocaleString()}</span>
                </div>
                {dataNota.metode === "Tunai" && (
                  <div className="d-flex justify-content-between small text-secondary">
                    <span>Kembali</span>
                    <span>{dataNota.kembalian.toLocaleString()}</span>
                  </div>
                )}
              </div>
              <div className="text-center mt-4 small border-top pt-2 text-muted">
                Terima Kasih Atas Kunjungan Anda
              </div>
            </div>

            <div className="p-3 bg-light d-grid gap-2 no-print border-top rounded-bottom">
              {dataNota.isNew ? (
                <>
                  <button
                    className="btn btn-primary fw-bold py-2"
                    onClick={() => simpanTransaksi(true)}
                  >
                    <i className="bi bi-printer me-2"></i> SIMPAN & CETAK
                  </button>
                  <button
                    className="btn btn-outline-primary fw-bold"
                    onClick={() => simpanTransaksi(false)}
                  >
                    <i className="bi bi-save me-2"></i> HANYA SIMPAN
                  </button>
                  <button
                    className="btn btn-link text-danger fw-bold"
                    onClick={() => setShowModalNota(false)}
                  >
                    BATAL
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn btn-success fw-bold py-2"
                    onClick={() => window.print()}
                  >
                    <i className="bi bi-printer me-2"></i> CETAK ULANG
                  </button>
                  <button
                    className="btn btn-secondary fw-bold"
                    onClick={() => setShowModalNota(false)}
                  >
                    TUTUP
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL EDIT MENU --- */}
      {showModalEdit && menuDipilih && (
        <div className="modal-overlay">
          <div className="modal-card p-4">
            <h5 className="fw-bold mb-4 text-center">Update Informasi Menu</h5>
            <div className="mb-3 text-center">
              <img
                src={
                  menuDipilih.gambar
                    ? `http://localhost:5000/uploads/${menuDipilih.gambar}`
                    : "http://localhost:5000/uploads/default-food.jpg"
                }
                alt="Preview"
                className="img-thumbnail mb-2"
                style={{ height: "100px", width: "100px", objectFit: "cover" }}
              />
              <input
                type="file"
                className="form-control form-control-sm"
                accept="image/*"
                onChange={(e) => setFileGambar(e.target.files[0])}
              />
            </div>
            <div className="mb-3">
              <label className="small text-muted mb-1">Nama Produk</label>
              <input
                type="text"
                className="form-control"
                value={menuDipilih.nama_item}
                onChange={(e) =>
                  setMenuDipilih({ ...menuDipilih, nama_item: e.target.value })
                }
              />
            </div>
            <div className="row">
              <div className="col-6 mb-3">
                <label className="small text-muted mb-1">Harga (Rp)</label>
                <input
                  type="number"
                  className="form-control"
                  value={menuDipilih.harga}
                  onChange={(e) =>
                    setMenuDipilih({ ...menuDipilih, harga: e.target.value })
                  }
                />
              </div>
              <div className="col-6 mb-3">
                <label className="small text-muted mb-1">Stok Unit</label>
                <input
                  type="number"
                  className="form-control"
                  value={menuDipilih.stok}
                  onChange={(e) =>
                    setMenuDipilih({
                      ...menuDipilih,
                      stok: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="d-flex gap-2 mt-3">
              <button
                className="btn btn-light w-100"
                onClick={() => {
                  setShowModalEdit(false);
                  setFileGambar(null);
                }}
              >
                Batal
              </button>
              <button
                className="btn btn-primary w-100 fw-bold"
                onClick={async () => {
                  // VALIDASI UKURAN FILE DI MODAL EDIT
                  if (fileGambar && fileGambar.size > 2 * 1024 * 1024) {
                    return tampilNotif(
                      "Gambar terlalu besar! Maks 2MB.",
                      "danger",
                    );
                  }

                  const formData = new FormData();
                  formData.append("nama_item", menuDipilih.nama_item);
                  formData.append("kategori", menuDipilih.kategori);
                  formData.append("harga", menuDipilih.harga);
                  formData.append("stok", menuDipilih.stok);

                  try {
                    if (fileGambar) {
                      const compressed = await resizeImage(fileGambar);
                      formData.append("gambar", compressed, "update-menu.webp");
                    }

                    await axios.put(
                      `http://localhost:5000/api/menu/${menuDipilih.id}`,
                      formData,
                      { headers: { "Content-Type": "multipart/form-data" } },
                    );
                    setShowModalEdit(false);
                    setFileGambar(null);
                    ambilData();
                    tampilNotif("Perubahan Berhasil Disimpan");
                  } catch (err) {
                    tampilNotif("Gagal update menu", "danger");
                  }
                }}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL EDIT PROFIL --- */}
      {showModalEditProfil && (
        <div className="modal-overlay">
          <div className="modal-card p-4" style={{ maxWidth: "500px" }}>
            <h5 className="fw-bold mb-4">
              <i className="bi bi-pencil-square me-2"></i>Edit Profil Toko
            </h5>
            <div className="row g-3">
              <div className="col-12">
                <label className="small fw-bold text-muted">Nama Toko</label>
                <input
                  type="text"
                  className="form-control"
                  value={inputProfil.nama_shop}
                  onChange={(e) =>
                    setInputProfil({
                      ...inputProfil,
                      nama_shop: e.target.value,
                    })
                  }
                />
              </div>
              <div className="col-12">
                <label className="small fw-bold text-muted">Owner</label>
                <input
                  type="text"
                  className="form-control"
                  value={inputProfil.owner}
                  onChange={(e) =>
                    setInputProfil({ ...inputProfil, owner: e.target.value })
                  }
                />
              </div>
              <div className="col-12">
                <label className="small fw-bold text-muted">Alamat</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={inputProfil.alamat}
                  onChange={(e) =>
                    setInputProfil({ ...inputProfil, alamat: e.target.value })
                  }
                ></textarea>
              </div>
              <div className="col-6">
                <label className="small fw-bold text-muted">Username</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={inputProfil.username}
                  readOnly
                />
              </div>
              <div className="col-6">
                <label className="small fw-bold text-muted">
                  Password Baru
                </label>
                <input
                  type="password"
                  placeholder="Kosongkan jika tak diubah"
                  className="form-control"
                  onChange={(e) =>
                    setInputProfil({ ...inputProfil, password: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="d-flex gap-2 mt-4">
              <button
                className="btn btn-light w-100 rounded-pill fw-bold"
                onClick={() => setShowModalEditProfil(false)}
              >
                BATAL
              </button>
              <button
                className="btn btn-primary w-100 rounded-pill fw-bold"
                onClick={handleUpdateProfil}
              >
                SIMPAN PERUBAHAN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL KONFIRMASI HAPUS --- */}
      {showModalHapus && (
        <div className="modal-overlay">
          <div className="modal-card p-4 text-center">
            <div className="text-danger mb-3">
              <i
                className="bi bi-exclamation-octagon-fill"
                style={{ fontSize: "3.5rem" }}
              ></i>
            </div>
            <h5 className="fw-bold">Konfirmasi Hapus</h5>
            <p className="text-muted">
              Apakah Anda yakin ingin menghapus{" "}
              <span className="text-dark fw-bold">{dataHapus.nama}</span>?
            </p>
            <div className="d-flex gap-2 mt-4">
              <button
                className="btn btn-light w-100 rounded-pill fw-bold"
                onClick={() => setShowModalHapus(false)}
              >
                BATAL
              </button>
              <button
                className="btn btn-danger w-100 fw-bold rounded-pill shadow-sm"
                onClick={eksekusiHapus}
              >
                YA, HAPUS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
