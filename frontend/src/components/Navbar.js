// frontend/src/components/Navbar.js
import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      {/* LOGO */}
      <Link to="/" className="logo-box">
        <div className="logo-icon">🎬</div>
        <span className="logo-text">
          <span className="logo-film">Film</span>
          <span className="logo-rec">Rec</span>
        </span>
      </Link>

      {/* MENÜ */}
      <div className="nav-links">
        <Link to="/movies">Filmler</Link>
        <Link to="/trending">Trendler</Link>
        <Link to="/upcoming">Yakında</Link>
        <Link to="/watchlist">Listem</Link>
        <Link to="/about">Hakkımızda</Link>
        <Link to="/contact">İletişim</Link>
      </div>

      {/* LOGIN / USER */}
      <div className="nav-auth">
        {!user ? (
          <>
            <Link to="/login" className="btn-login">Giriş Yap</Link>
            <Link to="/register" className="btn-register">Kayıt Ol</Link>
          </>
        ) : (
          <div className="user-box">
            <span className="hello">Merhaba,</span>
            <span className="username">{user.username}</span>

            <button className="btn-logout" onClick={logout}>Çıkış</button>
          </div>
        )}
      </div>
    </nav>
  );
}
