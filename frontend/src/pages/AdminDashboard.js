import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { apiFetch } from "../api";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);

  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Stats Load
  useEffect(() => {
    if (activeTab === "dashboard") {
      loadStats();
      loadAnalytics();
    }
    if (activeTab === "users") loadUsers();
    if (activeTab === "movies") loadMovies();
  }, [activeTab]);

  // ... (existing functions)

  // Filtered Movies
  const filteredMovies = movies.filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );


  async function loadStats() {
    try {
      const data = await apiFetch("/admin/dashboard");
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadAnalytics() {
    try {
      const data = await apiFetch("/admin/analytics");
      setAnalytics(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadUsers() {
    try {
      const data = await apiFetch("/admin/users");
      setUsers(data);
    } catch (e) {
      console.error(e);
    }
  }

  // Actions
  async function handleAddMovie(e) {
    e.preventDefault();
    const form = e.target;
    // Check if form elements exist/are not null
    const title = form.elements.title.value;
    const overview = form.elements.overview.value;
    const release_date = form.elements.release_date.value;
    const poster_url = form.elements.poster_url.value;
    const genres = form.elements.genres.value;

    const body = { title, overview, release_date, poster_url, genres };

    try {
      await apiFetch("/admin/movies", {
        method: "POST",
        // Content-Type api.js içinde otomatik ekleniyor ama overrides için bırakabiliriz veya silebiliriz.
        // api.js zaten headers'ı yönetiyor ama merge etmiyor gibi (baştan tanımlıyor).
        // api.js içindeki headers tanımı: const headers = { "Content-Type": "application/json" };
        // Yani burada headers vermesek de olur ama api.js yapısına göre headers parametresi override edilmiyor,
        // api.js koduna baktığımızda: res = await fetch(url, { method, headers, ... })
        // apiFetch içinde dışarıdan gelen headers ile merge yok.
        // Ama sorun BODY kısmında.
        body: body // ✨ DÜZELTME: JSON.stringify(body) YAPMA! api.js bunu kendisi yapıyor.
      });
      alert("Film başarıyla eklendi!");
      form.reset();
      loadStats();
    } catch (err) {
      console.error(err);
      let msg = err.detail || err.message || JSON.stringify(err);
      if (typeof msg === 'object') {
        msg = JSON.stringify(msg, null, 2);
      }
      alert("Hata detayları:\n" + msg);
    }
  }

  async function handleDeleteUser(id) {
    if (!window.confirm("Kullanıcıyı silmek istediğinize emin misiniz?")) return;
    try {
      await apiFetch(`/admin/users/${id}`, { method: "DELETE" });
      setUsers(users.filter(u => u.id !== id));
      alert("Kullanıcı silindi.");
    } catch (err) {
      alert("Hata: " + err.message);
    }
  }

  async function toggleAdmin(id, currentStatus) {
    const newStatus = currentStatus === 1 ? 0 : 1;
    try {
      await apiFetch(`/admin/users/${id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_admin: newStatus })
      });
      setUsers(users.map(u => u.id === id ? { ...u, is_admin: newStatus } : u));
    } catch (err) {
      alert("Hata: " + err.message);
    }
  }

  async function loadMovies() {
    try {
      const data = await apiFetch("/movies/all");
      setMovies(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDeleteMovie(id) {
    if (!window.confirm("Filmi silmek istediğinize emin misiniz?")) return;
    try {
      await apiFetch(`/admin/movies/${id}`, { method: "DELETE" });
      setMovies(movies.filter(m => m.id !== id));
      alert("Film silindi.");
    } catch (err) {
      alert("Hata: " + err.message);
    }
  }

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <h2>Admin Panel</h2>
        <ul>
          <li className={activeTab === "dashboard" ? "active" : ""} onClick={() => setActiveTab("dashboard")}>Dashboard</li>
          <li className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>Kullanıcılar</li>
          <li className={activeTab === "movies" ? "active" : ""} onClick={() => setActiveTab("movies")}>Film Yönetimi</li>
          <li className={activeTab === "settings" ? "active" : ""} onClick={() => setActiveTab("settings")}>Ayarlar</li>
        </ul>
      </div>

      <div className="admin-content">
        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && stats && (
          <div>
            <div className="dashboard-grid">
              <div className="stat-card">
                <h3>Toplam Kullanıcı</h3>
                <p>{stats.total_users}</p>
              </div>
              <div className="stat-card">
                <h3>Toplam Film</h3>
                <p>{stats.total_movies}</p>
              </div>
              <div className="stat-card">
                <h3>Toplam Yorum</h3>
                <p>{stats.total_reviews}</p>
              </div>
            </div>

            {/* 🔥 GRAPHS SECTION (Real Data) */}
            {analytics && (
              <div className="charts-section">
                <div className="chart-box">
                  <h3>Haftalık Aktivite (Son 7 Gün)</h3>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <LineChart data={analytics.weekly_activity}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="day" stroke="#888" />
                        <YAxis stroke="#888" allowDecimals={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#222', border: 'none', borderRadius: '8px' }} />
                        <Legend />
                        <Line type="monotone" dataKey="new_users" name="Yeni Üye" stroke="#e50914" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="new_reviews" name="Yeni Yorum" stroke="#ffa000" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="chart-box">
                  <h3>Kullanıcı Dağılımı (Simüle)</h3>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart data={analytics.geography} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis type="number" stroke="#888" allowDecimals={false} />
                        <YAxis dataKey="country" type="category" stroke="#888" width={100} />
                        <Tooltip contentStyle={{ backgroundColor: '#222', border: 'none', borderRadius: '8px' }} />
                        <Bar dataKey="count" name="Kullanıcı Sayısı" fill="#333" radius={[0, 4, 4, 0]} barSize={30}>
                          {/* Highlight Turkey or Top 1 */}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div>
            <h2>Kullanıcı Yönetimi</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Kullanıcı Adı</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={u.is_admin === 1 ? "badge admin" : "badge user"}>
                        {u.is_admin === 1 ? "Admin" : "User"}
                      </span>
                    </td>
                    <td>
                      <button className="btn-small" onClick={() => toggleAdmin(u.id, u.is_admin)}>
                        {u.is_admin === 1 ? "User Yap" : "Admin Yap"}
                      </button>
                      <button className="btn-small delete" onClick={() => handleDeleteUser(u.id)}>Sil</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MOVIES TAB */}
        {activeTab === "movies" && (
          <div>
            <h2>Film Ekle</h2>
            <form className="admin-form" onSubmit={handleAddMovie}>
              <div className="form-group">
                <label>Film Adı</label>
                <input name="title" required placeholder="Örn: Inception" />
              </div>
              <div className="form-group">
                <label>Özet</label>
                <textarea name="overview" rows="4" placeholder="Film özeti..." />
              </div>
              <div className="row">
                <div className="form-group">
                  <label>Yıl</label>
                  <input name="release_date" placeholder="2010-07-16" />
                </div>
                <div className="form-group">
                  <label>Türler</label>
                  <input name="genres" placeholder='["Sci-Fi", "Action"]' />
                </div>
              </div>
              <div className="form-group">
                <label>Poster URL</label>
                <input name="poster_url" placeholder="https://..." />
              </div>
              <button type="submit" className="btn-primary">Filmi Kaydet</button>
            </form>

            <h2 style={{ marginTop: '40px' }}>Film Listesi</h2>

            {/* SEARCH INPUT */}
            <div style={{ marginBottom: '15px' }}>
              <input
                type="text"
                placeholder="Film ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #444',
                  backgroundColor: '#222',
                  color: '#fff'
                }}
              />
            </div>

            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Poster</th>
                    <th>Başlık</th>
                    <th>Yıl</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovies.map(m => (
                    <tr key={m.id}>
                      <td>{m.id}</td>
                      <td>
                        <img
                          src={m.poster_url || `https://image.tmdb.org/t/p/w92${m.poster_path}`}
                          alt={m.title}
                          style={{ width: '40px', borderRadius: '4px' }}
                        />
                      </td>
                      <td>{m.title}</td>
                      <td>{m.release_date ? m.release_date.split("-")[0] : "-"}</td>
                      <td>
                        <button className="btn-small delete" onClick={() => handleDeleteMovie(m.id)}>Sil</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="settings-container">
            <h2>Sistem Ayarları</h2>

            <div className="setting-card">
              <div className="setting-info">
                <h4>Yeni Üye Alımı</h4>
                <p>Siteye yeni kullanıcı kayıtlarını duraklat.</p>
              </div>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider round"></span>
              </label>
            </div>

            <div className="setting-card">
              <div className="setting-info">
                <h4>Bakım Modu</h4>
                <p>Siteyi sadece adminlerin erişimine açık hale getir.</p>
              </div>
              <label className="switch">
                <input type="checkbox" />
                <span className="slider round"></span>
              </label>
            </div>

            <div className="setting-card">
              <div className="setting-info">
                <h4>Önbellek (Cache) Temizle</h4>
                <p>Redis/Local önbelleği sıfırlar.</p>
              </div>
              <button className="btn-small delete" onClick={() => alert("Önbellek temizlendi!")}>Temizle</button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
