import React from "react";

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
  return (
    <div className="row g-3">
      <div className="col-md-4 order-1 order-md-2">
        <div className="card p-3 p-md-4 border-0 shadow-sm bg-dark text-white rounded-4 sticky-top-mobile sticky-md-top">
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

      <div className="col-md-8 order-2 order-md-1">
        <div className="card p-3 p-md-4 border-0 shadow-sm rounded-4 mb-4">
          <div className="d-flex flex-column mb-3 gap-2">
            <h5 className="fw-bold mb-0">Daftar Menu</h5>
            <div className="search-wrapper">
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
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="row g-2 g-md-3">
            {dapatkanMenuTersaring()
              .sort((a, b) => a.nama_item.localeCompare(b.nama_item))
              .map((item) => (
                <div
                  className="col-6 col-md-4"
                  key={item.id}
                  onClick={() => tambahKeKeranjang(item)}
                >
                  <div className="card p-2 p-md-3 border-0 shadow-sm rounded-3 card-menu h-100">
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
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kasir;
