import React, { useState } from "react";

const Kasir = ({
  keranjang,
  setKeranjang,
  updateQtyKeranjang,
  hitungTotal,
  metodeBayar,
  setMetodeBayar,
  uangDiterima,
  setUangDiterima,
  previewNota,
  cariMenu,
  setCariMenu,
  dapatkanMenuTersaring,
  tambahKeKeranjang,
}) => {
  const [filterKategori, setFilterKategori] = useState("Semua");

  const menuTersaringDanTerurut = dapatkanMenuTersaring()
    .filter((item) => {
      if (filterKategori === "Semua") return true;
      return item.kategori.toLowerCase() === filterKategori.toLowerCase();
    })
    .sort((a, b) => a.nama_item.localeCompare(b.nama_item));

  // Mendeteksi apakah layar berukuran mobile untuk mengatur inline style secara dinamis
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="row g-3">
      {/* BAGIAN KERANJANG */}
      <div className="col-md-4 order-1 order-md-2">
        <div
          className="card p-3 p-md-4 border-0 shadow-sm bg-dark text-white rounded-4 sticky-md-top"
          style={{
            /* Jika mobile, jangan kasih jarak top yang besar agar tidak menutupi menu */
            top: isMobile ? "0px" : "90px",
            zIndex: 1010,
            marginBottom: isMobile ? "1rem" : "0",
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="text-warning fw-bold mb-0">Keranjang</h5>
            {keranjang.length > 0 && (
              <button
                className="btn btn-warning btn-sm fw-bold px-2 py-1"
                style={{ fontSize: "0.75rem" }}
                onClick={() => setKeranjang([])}
              >
                Hapus Semua
              </button>
            )}
          </div>

          <div
            style={{
              maxHeight: isMobile ? "200px" : "400px",
              overflowY: "auto",
            }}
          >
            {keranjang.length === 0 && (
              <p className="text-muted small">Belum ada item.</p>
            )}
            {keranjang.map((item) => (
              <div
                className="d-flex justify-content-between align-items-center mb-3"
                key={item.id}
              >
                <div
                  className="small"
                  style={{ width: "40%", fontSize: "0.85rem" }}
                >
                  {item.nama_item}
                </div>
                <div className="d-flex align-items-center bg-secondary rounded-2">
                  <button
                    className="btn btn-sm text-white px-2"
                    onClick={() => updateQtyKeranjang(item.id, -1)}
                  >
                    -
                  </button>
                  <span className="px-1 fw-bold">{item.qty}</span>
                  <button
                    className="btn btn-sm text-white px-2"
                    onClick={() => updateQtyKeranjang(item.id, 1)}
                  >
                    +
                  </button>
                </div>
                <button
                  className="btn btn-sm btn-outline-danger border-0"
                  onClick={() =>
                    setKeranjang(keranjang.filter((i) => i.id !== item.id))
                  }
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <hr />
          <div className="d-flex justify-content-between fw-bold mb-3">
            <span>TOTAL</span>
            <span>Rp {hitungTotal().toLocaleString()}</span>
          </div>
          <div className="row g-2">
            <div className="col-6">
              <select
                className="form-select form-select-sm mb-3"
                value={metodeBayar}
                onChange={(e) => setMetodeBayar(e.target.value)}
              >
                <option value="Tunai">Tunai</option>
                <option value="Transfer">Transfer</option>
              </select>
            </div>
            <div className="col-6">
              {metodeBayar === "Tunai" && (
                <input
                  type="number"
                  className="form-control form-control-sm mb-3"
                  placeholder="Bayar"
                  value={uangDiterima || ""}
                  onChange={(e) =>
                    setUangDiterima(parseInt(e.target.value) || 0)
                  }
                />
              )}
            </div>
          </div>
          <button
            className="btn btn-warning w-100 fw-bold"
            onClick={previewNota}
            disabled={keranjang.length === 0}
          >
            BAYAR SEKARANG
          </button>
        </div>
      </div>

      {/* BAGIAN DAFTAR MENU */}
      <div className="col-md-8 order-2 order-md-1">
        <div className="card p-3 p-md-4 border-0 shadow-sm rounded-4 mb-4">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-3 gap-3">
            <div>
              <h5 className="fw-bold mb-2">Daftar Menu</h5>
              <div className="btn-group btn-group-sm">
                {["Semua", "Makanan", "Minuman"].map((kat) => (
                  <button
                    key={kat}
                    className={`btn ${
                      filterKategori === kat
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => setFilterKategori(kat)}
                  >
                    {kat}
                  </button>
                ))}
              </div>
            </div>
            <div
              className="search-wrapper position-relative"
              style={{ minWidth: "200px" }}
            >
              <input
                type="text"
                className="form-control w-100 form-control-sm"
                placeholder="Cari menu..."
                value={cariMenu}
                onChange={(e) => setCariMenu(e.target.value)}
              />
              {cariMenu && (
                <button
                  className="btn-reset-search"
                  onClick={() => setCariMenu("")}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    color: "#ccc",
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="row g-2 g-md-3">
            {menuTersaringDanTerurut.length > 0 ? (
              menuTersaringDanTerurut.map((item) => (
                <div
                  className="col-6 col-md-4"
                  key={item.id}
                  onClick={() => tambahKeKeranjang(item)}
                >
                  <div
                    className="card border-0 shadow-sm rounded-3 card-menu h-100 overflow-hidden"
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={
                        item.gambar
                          ? `http://localhost:5000/uploads/${item.gambar}`
                          : item.kategori === "minuman"
                            ? "http://localhost:5000/uploads/default-drink.jpg"
                            : "http://localhost:5000/uploads/default-food.jpg"
                      }
                      alt={item.nama_item}
                      className="card-img-top"
                      style={{
                        height: "120px",
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

                    <div className="card-body p-2 p-md-3">
                      <h6 className="fw-bold mb-1 small">{item.nama_item}</h6>
                      <div className="text-success small fw-bold">
                        Rp {Number(item.harga).toLocaleString("id-ID")}
                      </div>
                      <small
                        className="text-muted"
                        style={{ fontSize: "0.75rem" }}
                      >
                        Stok: {item.stok}
                      </small>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5 text-muted">
                Menu tidak ditemukan.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kasir;
