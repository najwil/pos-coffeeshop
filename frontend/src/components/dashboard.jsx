import React from "react";

const Dashboard = ({ namaShop, laporan }) => {
  return (
    <div className="row g-4">
      <div className="col-12">
        <div className="card border-0 shadow-sm p-4 p-md-5 bg-primary text-white rounded-4">
          <h1 className="fw-bold">Halo, Admin!</h1>
          <p>Monitor pendapatan {namaShop} secara real-time.</p>
        </div>
      </div>
      <div className="col-md-6">
        <div className="card border-0 shadow-sm p-4 rounded-4 text-center">
          <h6 className="text-muted small fw-bold">OMZET HARI INI</h6>
          <h2 className="fw-bold text-success">
            Rp{" "}
            {laporan
              .filter(
                (i) =>
                  new Date(i.tanggal).toDateString() ===
                  new Date().toDateString(),
              )
              .reduce((a, b) => a + b.total_bayar, 0)
              .toLocaleString("id-ID")}
          </h2>
        </div>
      </div>
      <div className="col-md-6">
        <div className="card border-0 shadow-sm p-4 rounded-4 text-center">
          <h6 className="text-muted small fw-bold">OMZET BULAN INI</h6>
          <h2 className="fw-bold text-primary">
            Rp{" "}
            {laporan
              .filter(
                (i) =>
                  new Date(i.tanggal).getMonth() === new Date().getMonth() &&
                  new Date(i.tanggal).getFullYear() ===
                    new Date().getFullYear(),
              )
              .reduce((a, b) => a + b.total_bayar, 0)
              .toLocaleString("id-ID")}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
