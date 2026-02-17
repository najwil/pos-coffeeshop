import React from "react";

const Laporan = ({
  laporan,
  filterTanggal,
  setFilterTanggal,
  handleCetakUlang,
  setShowModalHapus, // Prop baru untuk buka modal
  setDataHapus, // Prop baru untuk set data yang mau dihapus
}) => {
  // Fungsi untuk memicu modal hapus buatan kita
  const triggerHapus = (id) => {
    setDataHapus({
      id: id,
      tipe: "transaksi",
      nama: "Transaksi ini",
    });
    setShowModalHapus(true);
  };

  const dataTersaring = laporan.filter(
    (i) => !filterTanggal || i.tanggal.includes(filterTanggal),
  );

  return (
    <div className="card p-3 p-md-4 border-0 shadow-sm rounded-4 overflow-auto">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <h5 className="fw-bold mb-0">Laporan Penjualan</h5>
        <div
          className="d-flex align-items-center gap-2"
          style={{ minWidth: "320px" }}
        >
          <small className="text-muted text-nowrap">Pilih Tanggal :</small>
          <div className="date-input-container">
            <input
              type="date"
              className="form-control form-control-sm"
              value={filterTanggal}
              onChange={(e) => setFilterTanggal(e.target.value)}
            />
            {filterTanggal && (
              <button
                className="btn-reset-date"
                onClick={() => setFilterTanggal("")}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      <table
        className="table table-hover align-middle"
        style={{ minWidth: "650px" }}
      >
        <thead className="table-dark">
          <tr>
            <th>Waktu</th>
            <th>Rincian</th>
            <th>Total</th>
            <th className="text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {dataTersaring.map((trx) => (
            <tr key={trx.id}>
              <td className="small">
                {new Date(trx.tanggal).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}{" "}
                {new Date(trx.tanggal).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td>
                <small>{trx.rincian}</small>
              </td>
              <td className="fw-bold text-success">
                Rp {trx.total_bayar.toLocaleString()}
              </td>
              <td className="text-center">
                <div className="d-flex gap-1 justify-content-center">
                  <button
                    className="btn btn-sm btn-primary rounded-pill px-3"
                    onClick={() => handleCetakUlang(trx)}
                  >
                    Cetak
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger rounded-pill px-3"
                    onClick={() => triggerHapus(trx.id)}
                  >
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {dataTersaring.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center text-muted py-4">
                Tidak ada data transaksi pada tanggal ini.
              </td>
            </tr>
          )}
        </tbody>
        <tfoot className="table-light fw-bold">
          <tr>
            <td colSpan="2" className="text-end py-3">
              TOTAL :
            </td>
            <td colSpan="2" className="text-success py-3">
              Rp{" "}
              {dataTersaring
                .reduce((s, it) => s + it.total_bayar, 0)
                .toLocaleString()}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default Laporan;
