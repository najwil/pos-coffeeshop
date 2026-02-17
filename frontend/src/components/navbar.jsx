import React from "react";

const Navbar = ({ namaShop, halaman, setHalaman, setIsLogin }) => {
  return (
    <div
      className="sticky-top no-print"
      style={{
        top: 0,
        zIndex: 1020,
        paddingTop: "10px",
        paddingBottom: "1px",
        backgroundColor: "transparent", // Memastikan wrapper utama tidak menimpa warna
      }}
    >
      {/* LAPISAN PEMBLOKIR (BLOCKER)
          Lapisan ini dibuat menutupi celah atas dan memanjang ke bawah 
          tepat di belakang lengkungan (corner) Navbar agar menu tidak terlihat di pojok.
      */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "40px", // Menutup area dari paling atas hingga pertengahan tinggi navbar
          backgroundColor: "#f8f9fa", // PASTIKAN warna ini sama persis dengan background body/aplikasi
          zIndex: -1,
        }}
      ></div>

      <div
        className="d-flex justify-content-between align-items-center bg-white p-3 shadow-sm rounded-4 nav-wrapper"
        style={{
          marginBottom: "1.5rem",
          position: "relative", // Memastikan navbar tetap di depan blocker
        }}
      >
        <div className="shop-title">
          <h4 className="fw-bold mb-0 text-primary">☕ {namaShop}</h4>
        </div>
        <div className="d-flex gap-1 gap-md-2 nav-links">
          {["dashboard", "kasir", "admin", "laporan"].map((p) => (
            <button
              key={p}
              className={`btn btn-sm px-2 px-md-3 rounded-3 fw-bold ${
                halaman === p ? "btn-primary shadow-sm" : "btn-light"
              }`}
              onClick={() => setHalaman(p)}
            >
              {p.toUpperCase()}
            </button>
          ))}
          <div className="ms-2 border-start ps-2">
            <button
              className="btn btn-sm btn-outline-danger rounded-3"
              onClick={() => setIsLogin(false)}
            >
              <i className="bi bi-box-arrow-right me-1"></i> Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
