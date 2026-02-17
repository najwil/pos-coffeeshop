import React, { useState } from "react";

const Admin = ({
  handleUpdateNamaShop,
  inputNamaBaru,
  setInputNamaBaru,
  axios,
  namaItem,
  setNamaItem,
  kategoriInput,
  setKategoriInput,
  harga,
  setHarga,
  stok,
  setStok,
  setFileGambar, // Pastikan prop ini dikirim dari App.jsx
  handleTambahMenu, // Gunakan fungsi handleTambahMenu yang sudah kita update di App.jsx
  ambilData,
  tampilNotif,
  requestSort,
  sortConfig,
  dapatkanMenuTersaring,
  setMenuDipilih,
  setShowModalEdit,
  setDataHapus,
  setShowModalHapus,
  dataProfil,
  setShowModalEditProfil,
}) => {
  // State Internal untuk navigasi Tab
  const [tabAktif, setTabAktif] = useState("inventori");

  const pemicuHapus = (item) => {
    setDataHapus({
      id: item.id,
      tipe: "menu",
      nama: item.nama_item,
    });
    setShowModalHapus(true);
  };

  // Note: Fungsi handleTambahMenu sekarang menggunakan yang dikirim dari props
  // karena logika FormData (untuk gambar) lebih bersih jika dikelola di App.jsx bersama axios

  return (
    <div className="admin-wrapper">
      {/* --- MENU TAB NAVIGATION --- */}
      <div
        className="d-flex gap-2 mb-4 bg-white p-2 rounded-4 shadow-sm"
        style={{ width: "fit-content" }}
      >
        <button
          className={`btn rounded-pill px-4 fw-bold ${tabAktif === "profil" ? "btn-primary" : "btn-light text-muted"}`}
          onClick={() => setTabAktif("profil")}
        >
          👤 Profil
        </button>
        <button
          className={`btn rounded-pill px-4 fw-bold ${tabAktif === "inventori" ? "btn-primary" : "btn-light text-muted"}`}
          onClick={() => setTabAktif("inventori")}
        >
          📦 Inventori Menu
        </button>
      </div>

      {/* --- ISI TAB: PROFIL --- */}
      {tabAktif === "profil" && (
        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 position-relative">
          <button
            className="btn btn-warning btn-sm rounded-pill px-3 fw-bold position-absolute top-0 end-0 mt-4 me-4 shadow-sm"
            onClick={() => setShowModalEditProfil(true)}
          >
            <i className="bi bi-pencil-square me-1"></i> Edit Profil
          </button>

          <div className="row align-items-center">
            <div className="col-md-3 text-center mb-4 mb-md-0">
              <div
                className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto shadow-inner"
                style={{
                  width: "160px",
                  height: "160px",
                  border: "4px solid #fff",
                  outline: "1px solid #dee2e6",
                }}
              >
                <i
                  className="bi bi-shop text-secondary"
                  style={{ fontSize: "4rem" }}
                ></i>
              </div>
              <small className="text-muted d-block mt-2">Logo Toko</small>
            </div>

            <div className="col-md-9 ps-md-5">
              <h3 className="fw-bold text-dark mb-4">Informasi Bisnis</h3>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="small text-uppercase fw-bold text-muted d-block mb-1">
                    Nama Toko
                  </label>
                  <p className="fs-5 fw-semibold">
                    {dataProfil?.nama_shop || "Belum diatur"}
                  </p>
                </div>
                <div className="col-md-6">
                  <label className="small text-uppercase fw-bold text-muted d-block mb-1">
                    Owner / Pemilik
                  </label>
                  <p className="fs-5 fw-semibold">{dataProfil?.owner || "-"}</p>
                </div>
                <div className="col-12">
                  <label className="small text-uppercase fw-bold text-muted d-block mb-1">
                    Alamat Lengkap
                  </label>
                  <p className="fw-medium text-secondary">
                    {dataProfil?.alamat || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ISI TAB: INVENTORI --- */}
      {tabAktif === "inventori" && (
        <div className="row g-4">
          <div className="col-lg-4">
            <div
              className="card p-3 p-md-4 border-0 shadow-sm rounded-4 sticky-md-top"
              style={{ top: "1rem" }}
            >
              <h6 className="fw-bold mb-3 text-success">
                <i className="bi bi-plus-circle me-2"></i>Tambah Menu Baru
              </h6>
              <form onSubmit={handleTambahMenu}>
                <div className="mb-2">
                  <label className="small text-muted mb-1">Nama Produk</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Es Teh"
                    value={namaItem}
                    onChange={(e) => setNamaItem(e.target.value)}
                    required
                  />
                </div>

                {/* --- INPUT FILE GAMBAR BARU --- */}
                <div className="mb-2">
                  <label className="small text-muted mb-1">Gambar Produk</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={(e) => setFileGambar(e.target.files[0])}
                  />
                  <small className="text-muted" style={{ fontSize: "10px" }}>
                    Format: JPG/PNG, Maks 2MB
                  </small>
                </div>

                <div className="mb-2">
                  <label className="small text-muted mb-1">Kategori</label>
                  <select
                    className="form-select text-capitalize"
                    value={kategoriInput}
                    onChange={(e) => setKategoriInput(e.target.value)}
                  >
                    <option value="makanan">Makanan</option>
                    <option value="minuman">Minuman</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
                <div className="mb-2">
                  <label className="small text-muted mb-1">Harga (Rp)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0"
                    value={harga}
                    onChange={(e) => setHarga(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="small text-muted mb-1">Stok Awal</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0"
                    value={stok}
                    onChange={(e) => setStok(parseInt(e.target.value) || 0)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-success w-100 fw-bold py-2 rounded-3 shadow-sm"
                >
                  SIMPAN KE DATABASE
                </button>
              </form>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card p-3 p-md-4 border-0 shadow-sm rounded-4 overflow-hidden">
              <h6 className="fw-bold mb-3 text-primary">
                <i className="bi bi-list-ul me-2"></i>Daftar Inventori Menu
              </h6>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr className="small text-muted text-uppercase">
                      <th className="py-3">Gambar</th>
                      <th
                        className="sortable py-3"
                        onClick={() => requestSort("nama_item")}
                      >
                        Nama{" "}
                        {sortConfig.key === "nama_item"
                          ? sortConfig.direction === "asc"
                            ? "🔼"
                            : "🔽"
                          : "↕️"}
                      </th>
                      <th
                        className="sortable py-3"
                        onClick={() => requestSort("kategori")}
                      >
                        Kat{" "}
                        {sortConfig.key === "kategori"
                          ? sortConfig.direction === "asc"
                            ? "🔼"
                            : "🔽"
                          : "↕️"}
                      </th>
                      <th
                        className="sortable py-3"
                        onClick={() => requestSort("harga")}
                      >
                        Harga{" "}
                        {sortConfig.key === "harga"
                          ? sortConfig.direction === "asc"
                            ? "🔼"
                            : "🔽"
                          : "↕️"}
                      </th>
                      <th
                        className="sortable py-3"
                        onClick={() => requestSort("stok")}
                      >
                        Stok{" "}
                        {sortConfig.key === "stok"
                          ? sortConfig.direction === "asc"
                            ? "🔼"
                            : "🔽"
                          : "↕️"}
                      </th>
                      <th className="text-center py-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dapatkanMenuTersaring().map((item) => (
                      <tr key={item.id}>
                        {/* --- KOLOM GAMBAR DENGAN LOGIKA KATEGORI DINAMIS --- */}
                        <td>
                          <img
                            src={
                              item.gambar
                                ? `http://localhost:5000/uploads/${item.gambar}`
                                : item.kategori === "minuman"
                                  ? "http://localhost:5000/uploads/default-drink.jpg"
                                  : "http://localhost:5000/uploads/default-food.jpg"
                            }
                            alt="thumb"
                            className="rounded shadow-sm"
                            style={{
                              width: "40px",
                              height: "40px",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                item.kategori === "minuman"
                                  ? "http://localhost:5000/uploads/default-drink.jpg"
                                  : "http://localhost:5000/uploads/default-food.jpg";
                            }}
                          />
                        </td>
                        <td className="fw-bold">{item.nama_item}</td>
                        <td>
                          <span className="badge bg-light text-dark border text-capitalize">
                            {item.kategori}
                          </span>
                        </td>
                        <td>Rp {Number(item.harga).toLocaleString()}</td>
                        <td>
                          <span
                            className={`badge ${item.stok < 5 ? "bg-danger" : "bg-secondary"}`}
                          >
                            {item.stok}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="d-flex gap-2 justify-content-center">
                            <button
                              className="btn btn-sm btn-outline-warning rounded-pill px-3"
                              onClick={() => {
                                setMenuDipilih(item);
                                setShowModalEdit(true);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger rounded-pill px-3"
                              onClick={() => pemicuHapus(item)}
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
