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
  const [inputNamaBaru, setInputNamaBaru] = useState("");
  const [daftarMenu, setDaftarMenu] = useState([]);
  const [laporan, setLaporan] = useState([]);

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

  // --- STATE CRUD ---
  const [namaItem, setNamaItem] = useState("");
  const [kategoriInput, setKategoriInput] = useState("makanan");
  const [harga, setHarga] = useState("");
  const [stok, setStok] = useState(0);
  const [menuDipilih, setMenuDipilih] = useState(null);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [showModalHapus, setShowModalHapus] = useState(false);
  const [idHapus, setIdHapus] = useState(null);
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

  const ambilData = async () => {
    try {
      const resProfil = await axios.get("http://localhost:5000/api/profil");
      setNamaShop(resProfil.data.nama_shop);
      setInputNamaBaru(resProfil.data.nama_shop);
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
      tampilNotif("Selamat Datang!");
    } else {
      // Menampilkan notifikasi merah saat gagal
      tampilNotif("Username atau Password Salah!", "danger");
    }
  };

  const handleUpdateNamaShop = async (e) => {
    e.preventDefault();
    try {
      await axios.put("http://localhost:5000/api/profil", {
        nama_shop: inputNamaBaru,
      });
      setNamaShop(inputNamaBaru);
      tampilNotif("Nama Toko Berhasil Diperbarui!");
    } catch (e) {
      tampilNotif("Gagal update nama toko", "danger");
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
      return tampilNotif("Uang kurang!", "danger");
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
      tampilNotif("Transaksi Berhasil!");
      setKeranjang([]);
      setUangDiterima(0);
      setShowModalNota(false);
      ambilData();
    } catch (e) {
      tampilNotif("Gagal simpan", "danger");
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

  if (!isLogin) {
    return (
      <div
        className="container d-flex justify-content-center align-items-center bg-light"
        style={{ height: "100vh" }}
      >
        {/* Notifikasi diletakkan di sini juga agar muncul saat gagal login */}
        {notif.show && (
          <div
            className="position-fixed top-0 start-50 translate-middle-x mt-3"
            style={{ zIndex: 9999 }}
          >
            <div
              className={`alert alert-${notif.tipe} shadow-lg fw-bold border-0 px-4`}
            >
              {notif.pesan}
            </div>
          </div>
        )}
        <div
          className="card p-5 shadow-lg border-0"
          style={{ width: "400px", borderRadius: "20px" }}
        >
          <h2 className="text-center fw-bold text-primary mb-4">LOGIN</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Username"
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="btn btn-primary w-100 fw-bold py-2 shadow">
              MASUK
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-2 mt-md-4 pb-5">
      {notif.show && (
        <div
          className="position-fixed top-0 start-50 translate-middle-x mt-3 no-print"
          style={{ zIndex: 9999 }}
        >
          <div
            className={`alert alert-${notif.tipe} shadow-lg fw-bold border-0 px-4`}
          >
            {notif.pesan}
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <Navbar
        namaShop={namaShop}
        halaman={halaman}
        setHalaman={setHalaman}
        setIsLogin={setIsLogin}
      />

      {/* DASHBOARD */}
      {halaman === "dashboard" && (
        <Dashboard namaShop={namaShop} laporan={laporan} />
      )}

      {/* KASIR */}
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

      {/* ADMIN */}
      {halaman === "admin" && (
        <Admin
          handleUpdateNamaShop={handleUpdateNamaShop}
          inputNamaBaru={inputNamaBaru}
          setInputNamaBaru={setInputNamaBaru}
          axios={axios}
          namaItem={namaItem}
          setNamaItem={setNamaItem}
          kategoriInput={kategoriInput}
          setKategoriInput={setKategoriInput}
          harga={harga}
          setHarga={setHarga}
          stok={stok}
          setStok={setStok}
          ambilData={ambilData}
          tampilNotif={tampilNotif}
          requestSort={requestSort}
          sortConfig={sortConfig}
          dapatkanMenuTersaring={dapatkanMenuTersaring}
          setMenuDipilih={setMenuDipilih}
          setShowModalEdit={setShowModalEdit}
          setIdHapus={setIdHapus}
          setShowModalHapus={setShowModalHapus}
        />
      )}

      {/* LAPORAN */}
      {halaman === "laporan" && (
        <Laporan
          laporan={laporan}
          filterTanggal={filterTanggal}
          setFilterTanggal={setFilterTanggal}
          handleCetakUlang={handleCetakUlang}
          ambilData={ambilData}
          tampilNotif={tampilNotif}
          axios={axios}
        />
      )}

      {/* MODAL PREVIEW NOTA */}
      {showModalNota && dataNota && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
        >
          <div className="modal-dialog modal-sm modal-dialog-centered px-3">
            <div className="modal-content p-4">
              <div id="area-nota">
                <div className="text-center font-monospace">
                  <h6 className="fw-bold">{namaShop}</h6>
                  <small>{dataNota.tanggal}</small>
                  <hr />
                  {dataNota.isNew ? (
                    dataNota.items.map((it, i) => (
                      <div key={i} className="d-flex justify-content-between">
                        <span className="small">
                          {it.nama_item} x{it.qty}
                        </span>
                        <span className="small">
                          {(it.harga * it.qty).toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="small text-start">
                      {dataNota.rincianRaw}
                    </div>
                  )}
                  <hr />
                  <div className="d-flex justify-content-between fw-bold">
                    <span>TOTAL</span>
                    <span>Rp {dataNota.total.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between small">
                    <span>Bayar</span>
                    <span>Rp {dataNota.bayar.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between small">
                    <span>Kembali</span>
                    <span>Rp {dataNota.kembalian.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 d-grid gap-2 no-print">
                {dataNota.isNew ? (
                  <>
                    <button
                      className="btn btn-success"
                      onClick={() => simpanTransaksi(true)}
                    >
                      Simpan & Cetak
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => simpanTransaksi(false)}
                    >
                      Simpan Saja
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-success"
                    onClick={() => window.print()}
                  >
                    Cetak Ulang
                  </button>
                )}
                <button
                  className="btn btn-light border"
                  onClick={() => setShowModalNota(false)}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT & HAPUS */}
      {showModalEdit && menuDipilih && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div className="modal-dialog modal-dialog-centered px-3">
            <div className="modal-content p-4 border-0">
              <h5 className="fw-bold mb-3">Edit Menu</h5>
              <input
                type="text"
                className="form-control mb-2"
                value={menuDipilih.nama_item}
                onChange={(e) =>
                  setMenuDipilih({ ...menuDipilih, nama_item: e.target.value })
                }
              />
              <input
                type="number"
                className="form-control mb-2"
                value={menuDipilih.harga}
                onChange={(e) =>
                  setMenuDipilih({ ...menuDipilih, harga: e.target.value })
                }
              />
              <input
                type="number"
                className="form-control mb-3"
                value={menuDipilih.stok}
                onChange={(e) =>
                  setMenuDipilih({
                    ...menuDipilih,
                    stok: parseInt(e.target.value) || 0,
                  })
                }
              />
              <button
                className="btn btn-primary w-100 fw-bold"
                onClick={async () => {
                  await axios.put(
                    `http://localhost:5000/api/menu/${menuDipilih.id}`,
                    menuDipilih,
                  );
                  setShowModalEdit(false);
                  ambilData();
                  tampilNotif("Berhasil Update");
                }}
              >
                Simpan
              </button>
              <button
                className="btn btn-light w-100 mt-2"
                onClick={() => setShowModalEdit(false)}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {showModalHapus && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        >
          <div className="modal-dialog modal-sm modal-dialog-centered text-center px-3">
            <div className="modal-content p-4 border-0 shadow">
              <h6 className="fw-bold">Hapus Menu?</h6>
              <div className="d-flex gap-2 mt-3">
                <button
                  className="btn btn-light w-100"
                  onClick={() => setShowModalHapus(false)}
                >
                  Batal
                </button>
                <button
                  className="btn btn-danger w-100"
                  onClick={async () => {
                    await axios.delete(
                      `http://localhost:5000/api/menu/${idHapus}`,
                    );
                    setShowModalHapus(false);
                    ambilData();
                    tampilNotif("Dihapus", "warning");
                  }}
                >
                  Ya
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
