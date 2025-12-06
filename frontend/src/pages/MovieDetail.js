// frontend/src/pages/MovieDetail.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./MovieDetail.css";

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [comment, setComment] = useState("");

  useEffect(() => {
    async function load() {
      try {
        // Film detay
        const res = await fetch(`http://localhost:8000/movies/${id}`);
        const data = await res.json();
        setMovie(data);

        // Benzer filmler
        const sim = await fetch(`http://localhost:8000/movies/${id}/similar`);
        const simData = await sim.json();

        // Array değilse çöker — o yüzden kontrol
        setSimilar(Array.isArray(simData) ? simData.slice(0, 6) : []);
      } catch (err) {
        console.error("Film yüklenemedi:", err);
      }
    }

    load();
  }, [id]);

  if (!movie) return <div className="loading">Yükleniyor...</div>;

  // -------------------------
  //   BACKEND LIKE & WATCHLIST
  // -------------------------

  const handleLike = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Lütfen giriş yap.");
      navigate("/login");
      return;
    }

    const res = await fetch(`http://localhost:8000/user/like/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    alert("❤️ " + (data.message || "İşlem tamamlandı"));
  };

  const handleAddList = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Lütfen giriş yap.");
      navigate("/login");
      return;
    }

    const res = await fetch(`http://localhost:8000/user/watchlist/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    alert("📌 " + (data.message || "Listeye eklendi"));
  };

  // -------------------------
  //   YORUM
  // -------------------------

  const handleSendComment = () => {
    if (!comment.trim()) return;
    alert("Yorum gönderildi:\n" + comment);
    setComment("");
  };

  // -------------------------
  //    RETURN UI
  // -------------------------

  return (
    <div className="detail-page">
      {/* SOL BLOK */}
      <div className="left">
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          className="detail-poster"
        />

        <div className="detail-buttons">
          <button className="btn red" onClick={handleLike}>
            ❤️ Beğen
          </button>

          <button className="btn red" onClick={handleAddList}>
            📌 Listeye Ekle
          </button>
        </div>
      </div>

      {/* SAĞ BLOK */}
      <div className="right">
        <h1 className="title">{movie.title}</h1>

        <p className="stats">
          {movie.release_date} • IMDb {movie.vote_average} •{" "}
          {movie.vote_count} oy
        </p>

        <h3>Yönetmen</h3>
        <p>{movie.directors?.[0]?.name || "Bilinmiyor"}</p>

        <h3>Özet</h3>
        <p className="overview">{movie.overview}</p>

        {/* Oyuncular */}
        <h2>Oyuncular</h2>
        <div className="cast-grid">
          {movie.cast?.slice(0, 6).map((c, i) => {
            const img = c.profile_path
              ? `https://image.tmdb.org/t/p/w300${c.profile_path}`
              : "/no-actor.png";

            return (
              <div key={i} className="cast-card">
                <img src={img} alt={c.name} />
                <div className="actor-name">{c.name}</div>
                <div className="actor-role">{c.character}</div>
              </div>
            );
          })}
        </div>

        {/* Benzer Filmler */}
        <h2 style={{ marginTop: "40px" }}>Benzer Filmler</h2>
        <div className="similar-grid">
          {similar.map((f) => (
            <div
              key={f.id}
              className="similar-card"
              onClick={() => navigate(`/movies/${f.id}`)}
            >
              <img
                src={`https://image.tmdb.org/t/p/w300${f.poster_path}`}
                alt={f.title}
              />
              <p>{f.title}</p>
            </div>
          ))}
        </div>

        {/* Yorum Alanı */}
        <h2 style={{ marginTop: "40px" }}>Yorum Yap</h2>
        <div className="comment-box">
          <textarea
            placeholder="Yorumunu yaz..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button className="btn red small" onClick={handleSendComment}>
            Gönder
          </button>
        </div>
      </div>
    </div>
  );
}
