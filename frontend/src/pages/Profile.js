import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collections, setCollections] = useState({ liked: [], watchlist: [], watched: [] });
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const res = await fetch("http://localhost:8000/user/collections", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) {
          setCollections({ liked: [], watchlist: [], watched: [] });
        } else {
          const data = await res.json();
          setCollections({
            liked: Array.isArray(data.liked) ? data.liked : [],
            watchlist: Array.isArray(data.watchlist) ? data.watchlist : [],
            watched: Array.isArray(data.watched) ? data.watched : [],
          });
        }
      } catch (error) {
        console.error("Fetch ERROR:", error);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  // ... (Avatar logic remains same)
  // ...

  // RENDER SECTION
  // ...

  {/* ALT KISIM: Koleksiyonlar */ }
  <h1>Arşiv</h1>

  {/* WATCHLIST (İzleme Listen) */ }
  <section style={{ marginBottom: 40 }}>
    <h2 style={{ color: "white", fontSize: "1.5rem", borderBottom: "1px solid #333", paddingBottom: 10 }}>İzleme Listen</h2>
    {collections.watchlist.length === 0 ? (
      <p style={{ color: "#bbb" }}>Listen boş. Film detay sayfalarından ekleme yapabilirsin.</p>
    ) : (
      <div className="grid">
        {collections.watchlist.map((m) => (
          <div className="movie-card" key={m.id} onClick={() => navigate(`/movies/${m.movie_id || m.id}`)} style={{ cursor: "pointer" }}>
            <img src={`https://image.tmdb.org/t/p/w300${m.poster_path}`} alt={m.title} />
            <p>{m.title}</p>
          </div>
        ))}
      </div>
    )}
  </section>

  {/* WATCHED (İzlediklerim) */ }
  <section style={{ marginBottom: 40 }}>
    <h2 style={{ color: "white", fontSize: "1.5rem", borderBottom: "1px solid #333", paddingBottom: 10 }}>İzlediklerim</h2>
    {collections.watched.length === 0 ? (
      <p style={{ color: "#bbb" }}>Henüz izlediğin film yok.</p>
    ) : (
      <div className="grid">
        {collections.watched.map((m) => (
          <div className="movie-card" key={m.id} onClick={() => navigate(`/movies/${m.movie_id || m.id}`)} style={{ cursor: "pointer" }}>
            <img src={`https://image.tmdb.org/t/p/w300${m.poster_path}`} alt={m.title} />
            <p>{m.title}</p>
          </div>
        ))}
      </div>
    )}
  </section>

  {/* LIKED (Beğendiklerin) */ }
  <section>
    <h2 style={{ color: "white", fontSize: "1.5rem", borderBottom: "1px solid #333", paddingBottom: 10 }}>Beğendiklerin</h2>
    {collections.liked.length === 0 ? (
      <p style={{ color: "#bbb" }}>Henüz beğenilmiş film yok.</p>
    ) : (
      <div className="grid">
        {collections.liked.map((m) => (
          <div className="movie-card" key={m.id} onClick={() => navigate(`/movies/${m.movie_id || m.id}`)} style={{ cursor: "pointer" }}>
            <img src={`https://image.tmdb.org/t/p/w300${m.poster_path}`} alt={m.title} />
            <p>{m.title}</p>
          </div>
        ))}
      </div>
    )}
  </section>

  const AVATAR_OPTIONS = [
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Milo",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Lola",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Abby",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Scooter",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Midnight",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Caleb",
  ];

  const handleAvatarSelect = async (url) => {
    try {
      await apiFetch("/auth/avatar", {
        method: "PUT",
        // header'ı api.js hallediyor ama burada kalsın veya silinebilir
        body: { avatar_url: url } // FIX: JSON.stringify kaldırıldı
      });
      alert("Profil fotoğrafı güncellendi!");
      window.location.reload();
    } catch (err) {
      alert("Hata: " + (err.detail || err.message || JSON.stringify(err)));
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz!")) return;

    try {
      await apiFetch("/auth/me", { method: "DELETE" });
      alert("Hesabınız silindi. Üzgünüz :(");
      logout();
      navigate("/");
    } catch (err) {
      alert("Hata: " + err.message);
    }
  };

  if (!user) return <div style={{ padding: 40, color: "white" }}>Lütfen giriş yapın.</div>;
  if (loading) return <div className="profile-page">Yükleniyor...</div>;

  return (
    <div className="profile-page">

      {/* ÜST KISIM: Profil Bilgileri */}
      <div className="profile-header" style={{
        display: "flex",
        gap: 40,
        padding: 40,
        background: "#1a1a1a",
        borderRadius: 12,
        marginBottom: 40,
        flexWrap: "wrap",
        alignItems: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <img
            src={user.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
            alt="Avatar"
            style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", marginBottom: 15, border: "4px solid #e50914" }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5, marginTop: 10 }}>
            {AVATAR_OPTIONS.map((url, i) => (
              <img
                key={i}
                src={url}
                onClick={() => handleAvatarSelect(url)}
                style={{
                  width: 40, height: 40, borderRadius: "50%", cursor: "pointer",
                  border: user.avatar_url === url ? "2px solid #e50914" : "2px solid transparent",
                  background: "#333"
                }}
                title="Seçmek için tıkla"
              />
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h1 style={{ marginTop: 0, fontSize: "2.5rem", marginBottom: 5 }}>{user.name || user.username}</h1>
          <p style={{ color: "#aaa", fontSize: "1.1rem", marginBottom: 20 }}>{user.email}</p>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ background: "#333", padding: "5px 12px", borderRadius: 20, color: "#fff", fontSize: "0.9rem" }}>Üye</span>
            {user.is_verified && (
              <span style={{ background: "green", padding: "5px 12px", borderRadius: 20, color: "#fff", fontSize: "0.9rem" }}>Doğrulanmış</span>
            )}
          </div>

          <div style={{ marginTop: 30 }}>
            <button onClick={handleDeleteAccount} style={{ background: "transparent", borderBottom: "1px solid #c00", color: "#c00", border: 'none', cursor: "pointer", opacity: 0.8 }}>
              Hesabı Sil
            </button>
          </div>
        </div>
      </div>

      {/* ALT KISIM: Koleksiyonlar - SADECE İZLENENLER */}
      <h1 style={{ marginTop: 40, borderBottom: "1px solid #333", paddingBottom: 15 }}>İzlediklerim</h1>

      {collections.watched.length === 0 ? (
        <p style={{ color: "#bbb", marginTop: 20 }}>Henüz izlediğin film yok. Filmleri "İzledim" olarak işaretleyerek buraya ekleyebilirsin.</p>
      ) : (
        <div className="grid" style={{ marginTop: 20 }}>
          {collections.watched.map((m) => (
            <div className="movie-card" key={m.id} onClick={() => navigate(`/movies/${m.movie_id || m.id}`)} style={{ cursor: "pointer" }}>
              <img src={`https://image.tmdb.org/t/p/w300${m.poster_path}`} alt={m.title} />
              <p>{m.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
