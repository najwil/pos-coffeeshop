import React from "react";

const Navbar = ({ namaShop, halaman, setHalaman, setIsLogin }) => {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4 no-print bg-white p-3 shadow-sm rounded-4 nav-wrapper">
      <div className="shop-title">
        <h4 className="fw-bold mb-0 text-primary">☕ {namaShop}</h4>
      </div>
      <div className="d-flex gap-1 gap-md-2 nav-links">
        {["dashboard", "kasir", "admin", "laporan"].map((p) => (
          <button
            key={p}
            className={`btn btn-sm px-2 px-md-3 rounded-3 ${
              halaman === p ? "btn-primary" : "btn-light"
            }`}
            onClick={() => setHalaman(p)}
          >
            {p.toUpperCase()}
          </button>
        ))}
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => setIsLogin(false)}
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Navbar;
