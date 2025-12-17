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
        <Link to="/watchlist">Kütüphanem</Link>
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
          <div className="user-box" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {user.is_admin === 1 && (
              <Link to="/admin" className="btn-admin-panel" style={{ color: '#e50914', border: '1px solid #e50914', padding: '5px 10px', borderRadius: '4px', textDecoration: 'none', marginRight: 0 }}>Admin</Link>
            )}

            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'white' }}>
              <img
                src={user.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
                alt="Avatar"
                style={{ width: 35, height: 35, borderRadius: "50%", objectFit: "cover", border: "2px solid #e50914" }}
              />
              <span className="username" style={{ fontWeight: 'bold' }}>{user.name || user.username}</span>
            </Link>

            <button className="btn-logout" onClick={logout} style={{ marginLeft: 10 }}>Çıkış</button>
          </div>
        )}
      </div>
    </nav>
  );
}
