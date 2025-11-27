import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="logo">FilmRec</Link>

        <Link to="/movies">Filmler</Link>
        <Link to="/trending">Trendler</Link>
        <Link to="/upcoming">Yakında</Link>
        <Link to="/series">Diziler</Link>
        <Link to="/watchlist">Listem</Link>
      </div>

      <div className="nav-right">
        <Link to="/login">Giriş</Link>
        <Link to="/register" className="register-btn">Kayıt Ol</Link>
      </div>
    </nav>
  );
}

export default Navbar;
