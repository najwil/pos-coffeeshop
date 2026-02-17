import React from "react";

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
  ambilData,
  tampilNotif,
  requestSort,
  sortConfig,
  dapatkanMenuTersaring,
  setMenuDipilih,
  setShowModalEdit,
  setIdHapus,
  setShowModalHapus,
}) => {
  return (
    <div className="row">
      <div className="col-md-4">
        {/* Identitas Toko */}
        <div className="card p-3 p-md-4 border-0 shadow-sm rounded-4 mb-4 bg-light border">
          <h6 className="fw-bold mb-3 text-primary">⚙️ Identitas Toko</h6>
          <form onSubmit={handleUpdateNamaShop}>
            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control form-control-sm"
                value={inputNamaBaru}
                onChange={(e) => setInputNamaBaru(e.target.value)}
                required
              />
              <button className="btn btn-primary btn-sm fw-bold">Update</button>
            </div>
          </form>
        </div>

        {/* Tambah Menu */}
        <div className="card p-3 p-md-4 border-0 shadow-sm rounded-4 mb-4">
          <h6 className="fw-bold mb-3">➕ Tambah Menu</h6>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await axios.post("http://localhost:5000/api/menu", {
                  nama_item: namaItem,
                  kategori: kategoriInput,
                  harga: Number(harga),
                  stok,
                });
                setNamaItem("");
                setHarga("");
                setStok(0);
                ambilData();
                tampilNotif("Berhasil Tambah Menu");
              } catch (e) {
                tampilNotif("Gagal", "danger");
              }
            }}
          >
            <input
              type="text"
              className="form-control form-control-sm mb-2"
              placeholder="Nama"
              value={namaItem}
              onChange={(e) => setNamaItem(e.target.value)}
              required
            />
            <select
              className="form-select form-select-sm mb-2"
              value={kategoriInput}
              onChange={(e) => setKategoriInput(e.target.value)}
            >
              <option value="makanan">Makanan</option>
              <option value="minuman">Minuman</option>
            </select>
            <input
              type="number"
              className="form-control form-control-sm mb-2"
              placeholder="Harga"
              value={harga}
              onChange={(e) => setHarga(e.target.value)}
              required
            />
            <input
              type="number"
              className="form-control form-control-sm mb-3"
              placeholder="Stok"
              value={stok}
              onChange={(e) => setStok(parseInt(e.target.value) || 0)}
              required
            />
            <button className="btn btn-success btn-sm w-100 fw-bold">
              Simpan
            </button>
          </form>
        </div>
      </div>

      <div className="col-md-8">
        <div className="card p-3 p-md-4 border-0 shadow-sm rounded-4 overflow-auto">
          <table
            className="table table-hover align-middle"
            style={{ minWidth: "500px" }}
          >
            <thead>
              <tr className="small text-muted">
                <th
                  className="sortable"
                  onClick={() => requestSort("nama_item")}
                >
                  Nama{" "}
                  {sortConfig.key === "nama_item"
                    ? sortConfig.direction === "asc"
                      ? "🔼"
                      : "🔽"
                    : "↕️"}
                </th>
                <th className="sortable" onClick={() => requestSort("harga")}>
                  Harga{" "}
                  {sortConfig.key === "harga"
                    ? sortConfig.direction === "asc"
                      ? "🔼"
                      : "🔽"
                    : "↕️"}
                </th>
                <th className="sortable" onClick={() => requestSort("stok")}>
                  Stok{" "}
                  {sortConfig.key === "stok"
                    ? sortConfig.direction === "asc"
                      ? "🔼"
                      : "🔽"
                    : "↕️"}
                </th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dapatkanMenuTersaring().map((item) => (
                <tr key={item.id}>
                  <td className="fw-bold">{item.nama_item}</td>
                  <td>{Number(item.harga).toLocaleString()}</td>
                  <td>{item.stok}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-1"
                      onClick={() => {
                        setMenuDipilih(item);
                        setShowModalEdit(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => {
                        setIdHapus(item.id);
                        setShowModalHapus(true);
                      }}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
